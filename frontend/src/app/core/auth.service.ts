import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { API_URL } from './config';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('chatdesk_user');
    if (raw) { try { this.user.set(JSON.parse(raw)); } catch { /* ignore */ } }
  }
  get token(): string | null { return localStorage.getItem('chatdesk_token'); }
  isLoggedIn(): boolean { return !!this.token; }
  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${API_URL}/api/auth/login`, { email, password }).pipe(
      tap(res => { localStorage.setItem('chatdesk_token', res.token); localStorage.setItem('chatdesk_user', JSON.stringify(res.user)); this.user.set(res.user); })
    );
  }
  logout(): void { localStorage.removeItem('chatdesk_token'); localStorage.removeItem('chatdesk_user'); this.user.set(null); }
}
