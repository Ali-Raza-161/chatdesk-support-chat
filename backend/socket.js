// Socket.IO events for ChatDesk.
// Rooms: one room per conversation, named "conv:<conversationId>".
// Events (client -> server): join-conversation, typing, send-message
// Events (server -> client): message, typing, joined
const { db } = require('./db');
function attachSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join-conversation', (conversationId) => {
      if (typeof conversationId !== 'string' || !conversationId) return;
      socket.join('conv:' + conversationId);
      socket.emit('joined', { conversationId });
    });
    socket.on('typing', (data) => {
      if (!data || !data.conversationId) return;
      socket.to('conv:' + data.conversationId).emit('typing', { conversationId: data.conversationId, sender: data.sender, senderName: data.senderName, isTyping: !!data.isTyping });
    });
    socket.on('send-message', async (data) => {
      try {
        if (!data || !data.conversationId || !data.text || !String(data.text).trim()) return;
        const conv = await db.getConversation(data.conversationId);
        if (!conv) { socket.emit('error-message', { error: 'Conversation not found' }); return; }
        const m = await db.createMessage({ conversationId: data.conversationId, sender: data.sender === 'agent' ? 'agent' : 'visitor', senderName: data.senderName || 'Visitor', text: String(data.text).trim() });
        io.to('conv:' + data.conversationId).emit('message', { id: String(m._id || m.id), conversationId: data.conversationId, sender: m.sender, senderName: m.senderName, text: m.text, createdAt: m.createdAt });
      } catch (e) { socket.emit('error-message', { error: 'Could not send message' }); }
    });
  });
}
module.exports = { attachSocket };
