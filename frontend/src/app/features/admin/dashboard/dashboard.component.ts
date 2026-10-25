import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../../core/chat.service';
import { Conversation } from '../../../core/models';
@Component({
  selector: 'app-admin-dashboard', standalone: true, imports: [CommonModule, RouterLink],
  template: `<section class="page"><h1>Support dashboard</h1>
  <p *ngIf="error()" class="err">{{ error() }}</p>
  <p *ngIf="!conversations().length && !error()">No chats yet. Open the chat widget as a visitor to create one.</p>
  <div class="row" *ngFor="let c of conversations()">
    <div><strong>{{ c.visitorName }}</strong><span class="sub"> — {{ c.subject || 'No subject' }}</span>
    <div class="meta">Last activity: {{ c.lastMessageAt | date:'short' }}</div></div>
    <div><span class="badge" *ngIf="c.unreadCount"> {{ c.unreadCount }} unread </span>
    <a class="btn" [routerLink]="['/admin/chat', c.id]">Open chat</a></div>
  </div></section>`,
  styles: [`.page{padding:32px 24px;max-width:820px;margin:0 auto}.row{display:flex;justify-content:space-between;gap:12px;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin:10px 0}.sub{color:#475569}.meta{color:#64748b;font-size:13px}.badge{background:#dc2626;color:#fff;border-radius:999px;padding:2px 10px;margin-right:8px}.btn{background:#2563eb;color:#fff;padding:8px 14px;border-radius:999px;text-decoration:none}.err{color:#dc2626}`]
})
export class AdminDashboardComponent implements OnInit {
  conversations = signal<Conversation[]>([]); error = signal('');
  constructor(private chat: ChatService) {}
  ngOnInit(): void { this.chat.listConversations().subscribe({ next: list => this.conversations.set(list), error: () => this.error.set('Could not load chats. Is the backend running and are you logged in?') }); }
}
