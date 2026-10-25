const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  subject: { type: String, default: '' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  unreadCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Conversation', conversationSchema);
