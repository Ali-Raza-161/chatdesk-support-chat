const express = require('express');
const { db } = require('../db');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

function norm(c) {
  if (!c) return null;
  return { id: String(c._id || c.id), visitorName: c.visitorName, subject: c.subject || '', status: c.status, unreadCount: c.unreadCount || 0, lastMessageAt: c.lastMessageAt, createdAt: c.createdAt };
}

// Public: a visitor starts a chat. No auth — the conversation id is the handle.
router.post('/', async (req, res) => {
  const { visitorName, subject } = req.body || {};
  if (!visitorName || !String(visitorName).trim()) return res.status(400).json({ error: 'Visitor name is required' });
  const conv = await db.createConversation({ visitorName: String(visitorName).trim(), subject: subject || '' });
  res.status(201).json(norm(conv));
});

// Admin: list all chats, newest first.
router.get('/', authRequired, async (req, res) => {
  const list = await db.listConversations();
  res.json(list.map(norm));
});

// Visitor or admin: read one conversation (id is unguessable in Mongo mode;
// in memory mode it is a generated id. Production should add a visitor token.)
router.get('/:id', async (req, res) => {
  const conv = await db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(norm(conv));
});

// Admin: mark a chat as read (clears unread count).
router.patch('/:id/read', authRequired, async (req, res) => {
  const conv = await db.markConversationRead(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(norm(conv));
});

// Messages for a chat.
router.get('/:id/messages', async (req, res) => {
  const conv = await db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  const msgs = await db.listMessages(req.params.id);
  res.json(msgs.map(m => ({ id: String(m._id || m.id), conversationId: String(m.conversationKey), sender: m.sender, senderName: m.senderName, text: m.text, createdAt: m.createdAt })));
});

// Send a message. Agent messages require a login; visitor messages do not.
router.post('/:id/messages', async (req, res) => {
  const { sender, senderName, text } = req.body || {};
  if (sender === 'agent') {
    // Reuse the same check as authRequired, inline to keep this route public for visitors.
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Agent login required to reply' });
    try { require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'chatdesk-dev-secret-change-me'); }
    catch (e) { return res.status(401).json({ error: 'Invalid or expired token' }); }
  }
  if (!['visitor', 'agent'].includes(sender)) return res.status(400).json({ error: 'sender must be visitor or agent' });
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'Message text is required' });
  const conv = await db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  const m = await db.createMessage({ conversationId: req.params.id, sender, senderName: senderName || (sender === 'agent' ? 'Support' : 'Visitor'), text: String(text).trim() });
  // Socket broadcast is attached to the app in server.js.
  const io = req.app.get('io');
  if (io) io.to('conv:' + req.params.id).emit('message', { id: String(m._id || m.id), conversationId: req.params.id, sender: m.sender, senderName: m.senderName, text: m.text, createdAt: m.createdAt });
  res.status(201).json({ id: String(m._id || m.id), conversationId: req.params.id, sender: m.sender, senderName: m.senderName, text: m.text, createdAt: m.createdAt });
});
module.exports = router;
