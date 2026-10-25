import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/chat.service';
import { SocketService } from '../../../core/socket.service';
import { ChatMessage } from '../../../core/models';
@Component({
  selector: 'app-admin-chat-window', standalone: true, imports: [FormsModule, CommonModule],
  template: `<section class="page"><h1>Chat</h1>
  <div class="msgs"><div *ngFor="let m of messages()" [class.agent]="m.sender === 'agent'" class="msg">
    <strong>{{ m.senderName }}</strong><p>{{ m.text }}</p><small>{{ m.createdAt | date:'shortTime' }}</small></div>
    <p class="typing" *ngIf="typing()">Visitor is typing…</p></div>
  <div class="send"><input [(ngModel)]="draft" (input)="onTyping()" (keyup.enter)="send()" placeholder="Reply as support…"><button class="btn" (click)="send()">Reply</button></div>
  <p class="err" *ngIf="error()">{{ error() }}</p></section>`,
  styles: [`.page{padding:32px 24px;max-width:720px;margin:0 auto}.msgs{height:420px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:14px;padding:14px}.msg{margin:8px 0;padding:8px 10px;border-radius:12px;background:#f1f5f9}.msg.agent{background:#dcfce7}.msg p{margin:4px 0}.send{display:flex;gap:8px;margin-top:12px}.send input{flex:1;padding:10px;border:1px solid #cbd5e1;border-radius:10px}.btn{background:#2563eb;color:#fff;border:0;padding:10px 18px;border-radius:999px}.typing{color:#64748b;font-style:italic}.err{color:#dc2626}`]
})
export class AdminChatWindowComponent implements OnInit, OnDestroy {
  messages = signal<ChatMessage[]>([]); typing = signal(false); error = signal(''); draft = '';
  private id = ''; private subs: Subscription[] = [];
  constructor(private route: ActivatedRoute, private chat: ChatService, private socket: SocketService) {}
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) { this.error.set('No conversation id.'); return; }
    this.socket.joinConversation(this.id);
    this.chat.getMessages(this.id).subscribe({ next: list => this.messages.set(list), error: () => this.error.set('Could not load messages.') });
    this.chat.markRead(this.id).subscribe({ error: () => {} });
    this.subs.push(this.socket.onMessage().subscribe(m => { if (m.conversationId === this.id) this.messages.update(list => [...list, m]); }));
    this.subs.push(this.socket.onTyping().subscribe(t => { if (t.sender === 'visitor' && t.conversationId === this.id) this.typing.set(t.isTyping); }));
  }
  send(): void {
    const text = this.draft.trim(); if (!text) return; this.draft = '';
    this.socket.sendSocketMessage({ conversationId: this.id, sender: 'agent', senderName: 'Support', text });
  }
  onTyping(): void { this.socket.sendTyping(this.id, 'agent', 'Support', true); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
