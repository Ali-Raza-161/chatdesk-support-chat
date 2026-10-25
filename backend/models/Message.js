const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: false },
  conversationKey: { type: String, required: true },
  sender: { type: String, enum: ['visitor', 'agent'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });
module.exports = mongoose.model('Message', messageSchema);
