export interface User { id: string; name: string; email: string; role: string; }
export interface Conversation { id: string; visitorName: string; subject: string; status: string; unreadCount: number; lastMessageAt: string; createdAt: string; }
export interface ChatMessage { id: string; conversationId: string; sender: 'visitor' | 'agent'; senderName: string; text: string; createdAt: string; }
