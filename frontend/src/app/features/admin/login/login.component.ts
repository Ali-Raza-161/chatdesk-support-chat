import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
@Component({
  selector: 'app-admin-login', standalone: true, imports: [FormsModule, CommonModule],
  template: `<section class="page"><h1>Admin login</h1>
  <p class="demo">Demo only: admin&#64;chatdesk.demo / demo123 (change in production).</p>
  <form (ngSubmit)="submit()"><label>Email <input [(ngModel)]="email" name="email" type="email" required></label>
  <label>Password <input [(ngModel)]="password" name="password" type="password" required></label>
  <button class="btn" type="submit">Login</button></form><p class="err" *ngIf="error()">{{ error() }}</p></section>`,
  styles: [`.page{padding:32px 24px;max-width:480px;margin:0 auto}label{display:block;margin:12px 0}input{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;margin-top:6px}.btn{background:#2563eb;color:#fff;border:0;padding:10px 18px;border-radius:999px}.err{color:#dc2626}.demo{background:#fef9c3;padding:10px;border-radius:10px}`]
})
export class AdminLoginComponent {
  email = ''; password = ''; error = signal('');
  constructor(private auth: AuthService, private router: Router) {}
  submit(): void {
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => this.error.set('Login failed. Check the demo credentials and that the backend is running.')
    });
  }
}
