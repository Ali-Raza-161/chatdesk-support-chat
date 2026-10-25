import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config';
import { Conversation, ChatMessage } from './models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}
  createConversation(visitorName: string, subject = '') {
    return this.http.post<Conversation>(`${API_URL}/api/conversations`, { visitorName, subject });
  }
  listConversations() { return this.http.get<Conversation[]>(`${API_URL}/api/conversations`); }
  getMessages(conversationId: string) { return this.http.get<ChatMessage[]>(`${API_URL}/api/conversations/${conversationId}/messages`); }
  sendMessage(conversationId: string, sender: 'visitor' | 'agent', senderName: string, text: string) {
    return this.http.post<ChatMessage>(`${API_URL}/api/conversations/${conversationId}/messages`, { sender, senderName, text });
  }
  markRead(conversationId: string) { return this.http.patch<Conversation>(`${API_URL}/api/conversations/${conversationId}/read`, {}); }
}
