import { Component, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatService } from '../../core/chat.service';
import { SocketService } from '../../core/socket.service';
import { ChatMessage } from '../../core/models';

@Component({
  selector: 'app-chat-widget', standalone: true, imports: [FormsModule, CommonModule],
  template: `
  <button class="fab" (click)="open.set(!open())">💬 Chat</button>
  <div class="panel" *ngIf="open()">
    <div class="panel-head"><strong>ChatDesk support</strong><button (click)="open.set(false)">✕</button></div>
    <div *ngIf="!conversationId()" class="start">
      <p>Hi! Apna naam likhen aur chat shuru karen.</p>
      <input [(ngModel)]="visitorName" placeholder="Your name">
      <input [(ngModel)]="subject" placeholder="Subject (optional)">
      <button class="btn" (click)="start()">Start chat</button>
      <p class="err" *ngIf="error()">{{ error() }}</p>
    </div>
    <div *ngIf="conversationId()" class="chat">
      <div class="msgs">
        <div *ngFor="let m of messages()" [class.me]="m.sender === 'visitor'" class="msg">
          <strong>{{ m.senderName }}</strong><p>{{ m.text }}</p><small>{{ m.createdAt | date:'shortTime' }}</small>
        </div>
        <p class="typing" *ngIf="typing()">Support is typing…</p>
      </div>
      <div class="send"><input [(ngModel)]="draft" (input)="onTyping()" (keyup.enter)="send()" placeholder="Type a message…"><button class="btn" (click)="send()">Send</button></div>
    </div>
  </div>`,
  styles: [`.fab{position:fixed;right:20px;bottom:20px;z-index:50;background:#2563eb;color:#fff;border:0;padding:14px 20px;border-radius:999px;font-size:16px;cursor:pointer}.panel{position:fixed;right:20px;bottom:80px;width:340px;max-width:92vw;height:440px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:50;display:flex;flex-direction:column;overflow:hidden}.panel-head{display:flex;justify-content:space-between;padding:12px 14px;background:#0f172a;color:#fff}.start,.chat{padding:14px}.start input,.send input{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;margin:6px 0}.btn{background:#2563eb;color:#fff;border:0;padding:10px 16px;border-radius:999px;cursor:pointer}.msgs{height:300px;overflow-y:auto}.msg{margin:8px 0;padding:8px 10px;border-radius:12px;background:#f1f5f9}.msg.me{background:#dbeafe}.msg p{margin:4px 0}.typing{color:#64748b;font-style:italic}.send{display:flex;gap:8px}.err{color:#dc2626}`]
})
export class ChatWidgetComponent implements OnDestroy {
  open = signal(false); error = signal(''); messages = signal<ChatMessage[]>([]); typing = signal(false);
  visitorName = ''; subject = ''; draft = ''; conversationId = signal<string | null>(null);
  private subs: Subscription[] = [];
  constructor(private chat: ChatService, private socket: SocketService) {
    this.subs.push(this.socket.onMessage().subscribe(m => {
      if (this.conversationId() && m.conversationId === this.conversationId()) this.messages.update(list => [...list, m]);
    }));
    this.subs.push(this.socket.onTyping().subscribe(t => {
      if (t.sender === 'agent' && t.conversationId === this.conversationId()) this.typing.set(t.isTyping);
    }));
  }
  start(): void {
    if (!this.visitorName.trim()) { this.error.set('Please enter your name.'); return; }
    this.error.set('');
    this.chat.createConversation(this.visitorName.trim(), this.subject.trim()).subscribe({
      next: conv => { this.conversationId.set(conv.id); this.socket.joinConversation(conv.id); },
      error: () => this.error.set('Could not start chat. Is the backend running on port 3000?')
    });
  }
  send(): void {
    const id = this.conversationId(); const text = this.draft.trim();
    if (!id || !text) return;
    this.draft = '';
    this.socket.sendSocketMessage({ conversationId: id, sender: 'visitor', senderName: this.visitorName.trim(), text });
  }
  onTyping(): void {
    const id = this.conversationId(); if (id) this.socket.sendTyping(id, 'visitor', this.visitorName.trim(), true);
  }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
