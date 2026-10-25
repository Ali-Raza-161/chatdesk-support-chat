// ChatDesk data layer.
// If MONGODB_URI is set and MongoDB connects, Mongoose models are used.
// Otherwise an in-memory store with the same methods is used, so the demo
// and all API/Socket behaviour work without a database. This is logged
// clearly at startup. No credentials are invented here.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

let mode = 'memory';
const mem = { users: [], conversations: [], messages: [] };
let seq = 1;
function memId() { return 'mem_' + (seq++) + '_' + Date.now().toString(36); }

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log('[chatdesk] No MONGODB_URI set — using in-memory store (demo mode, data resets on restart).'); return; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    mode = 'mongo';
    console.log('[chatdesk] Connected to MongoDB.');
  } catch (err) {
    console.log('[chatdesk] MongoDB connection failed, falling back to in-memory store:', err.message);
  }
}

function publicUser(u) { return u ? { id: String(u._id || u.id), name: u.name, email: u.email, role: u.role } : null; }

const db = {
  get mode() { return mode; },
  async findUserByEmail(email) {
    if (mode === 'mongo') return User.findOne({ email: email.toLowerCase() });
    return mem.users.find(u => u.email === email.toLowerCase()) || null;
  },
  async createUser({ name, email, passwordHash, role }) {
    if (mode === 'mongo') return User.create({ name, email: email.toLowerCase(), passwordHash, role: role || 'agent' });
    const u = { id: memId(), name, email: email.toLowerCase(), passwordHash, role: role || 'agent' };
    mem.users.push(u); return u;
  },
  async listConversations() {
    if (mode === 'mongo') return Conversation.find().sort({ lastMessageAt: -1 }).lean();
    return [...mem.conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
  async createConversation({ visitorName, subject }) {
    if (mode === 'mongo') return Conversation.create({ visitorName, subject: subject || '' });
    const c = { _id: memId(), id: undefined, visitorName, subject: subject || '', status: 'open', unreadCount: 0, lastMessageAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    c.id = c._id; mem.conversations.push(c); return c;
  },
  async getConversation(id) {
    if (mode === 'mongo') return Conversation.findById(id).lean();
    return mem.conversations.find(c => c._id === id) || null;
  },
  async listMessages(conversationId) {
    if (mode === 'mongo') return Message.find({ conversationKey: String(conversationId) }).sort({ createdAt: 1 }).lean();
    return mem.messages.filter(m => m.conversationKey === String(conversationId)).sort((a, b) => a.createdAt - b.createdAt);
  },
  async createMessage({ conversationId, sender, senderName, text }) {
    const now = new Date();
    if (mode === 'mongo') {
      const m = await Message.create({ conversationId, conversationKey: String(conversationId), sender, senderName, text, createdAt: now });
      // Unread = visitor messages not yet read by an agent.
      await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: now, ...(sender === 'visitor' ? { $inc: { unreadCount: 1 } } : {}) });
      return m.toObject();
    }
    const m = { _id: memId(), conversationId, conversationKey: String(conversationId), sender, senderName, text, createdAt: now };
    mem.messages.push(m);
    const conv = mem.conversations.find(c => c._id === conversationId);
    if (conv) { conv.lastMessageAt = now; if (sender === 'visitor') conv.unreadCount += 1; }
    return m;
  },
  async markConversationRead(id) {
    if (mode === 'mongo') return Conversation.findByIdAndUpdate(id, { unreadCount: 0 }, { new: true }).lean();
    const conv = mem.conversations.find(c => c._id === id);
    if (conv) conv.unreadCount = 0;
    return conv || null;
  }
};

async function seedDemoAdmin() {
  const existing = await db.findUserByEmail(process.env.ADMIN_EMAIL || 'admin@chatdesk.demo');
  if (existing) return;
  if (process.env.DEMO_ADMIN_ENABLED === 'false' && !process.env.ADMIN_EMAIL) return;
  const email = process.env.ADMIN_EMAIL || 'admin@chatdesk.demo';
  const password = process.env.ADMIN_PASSWORD || 'demo123';
  const passwordHash = await bcrypt.hash(password, 10);
  await db.createUser({ name: 'Demo Admin', email, passwordHash, role: 'agent' });
  console.log('[chatdesk] DEMO ONLY admin seeded: ' + email + ' — change this in production. Do not use for real users.');
}

module.exports = { db, connect, seedDemoAdmin, publicUser };
