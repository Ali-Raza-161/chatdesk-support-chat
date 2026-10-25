import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-contact', standalone: true, imports: [FormsModule, CommonModule],
  template: `<section class="page"><h1>Contact</h1>
  <p>For a fast answer, use the chat widget at the bottom-right of any page.</p>
  <form (ngSubmit)="sent.set(true)"><label>Name <input [(ngModel)]="name" name="name" required></label>
  <label>Message <textarea [(ngModel)]="msg" name="msg" rows="4" required></textarea></label>
  <button class="btn" type="submit">Send (demo)</button></form>
  <p *ngIf="sent()">Thanks — this contact form is a demo and does not send an email. Use live chat for the real flow.</p></section>`,
  styles: [`.page{padding:32px 24px;max-width:640px;margin:0 auto}label{display:block;margin:12px 0}input,textarea{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;margin-top:6px}.btn{background:#2563eb;color:#fff;border:0;padding:10px 18px;border-radius:999px}`]
})
export class ContactComponent { name = ''; msg = ''; sent = signal(false); }
