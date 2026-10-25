import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { API_URL } from './config';
import { ChatMessage } from './models';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  connect(): Socket {
    if (!this.socket) this.socket = io(API_URL, { transports: ['websocket', 'polling'] });
    return this.socket;
  }
  joinConversation(conversationId: string): void { this.connect().emit('join-conversation', conversationId); }
  sendSocketMessage(data: { conversationId: string; sender: 'visitor' | 'agent'; senderName: string; text: string }): void {
    this.connect().emit('send-message', data);
  }
  sendTyping(conversationId: string, sender: string, senderName: string, isTyping: boolean): void {
    this.connect().emit('typing', { conversationId, sender, senderName, isTyping });
  }
  onMessage(): Observable<ChatMessage> {
    return new Observable(observer => { const s = this.connect(); const h = (m: ChatMessage) => observer.next(m); s.on('message', h); return () => s.off('message', h); });
  }
  onTyping(): Observable<{ conversationId: string; sender: string; senderName: string; isTyping: boolean }> {
    return new Observable(observer => { const s = this.connect(); const h = (t: any) => observer.next(t); s.on('typing', h); return () => s.off('typing', h); });
  }
  disconnect(): void { this.socket?.disconnect(); this.socket = null; }
}
