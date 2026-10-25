import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navbar', standalone: true, imports: [RouterLink, RouterLinkActive],
  template: `<header class="nav"><a class="logo" routerLink="/">ChatDesk</a><nav>
    <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
    <a routerLink="/services" routerLinkActive="active">Services</a>
    <a routerLink="/about" routerLinkActive="active">About</a>
    <a routerLink="/contact" routerLinkActive="active">Contact</a>
    <a routerLink="/admin/login" routerLinkActive="active">Admin</a>
  </nav></header>`,
  styles: [`.nav{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;background:#0f172a;color:#fff}.logo{color:#fff;text-decoration:none;font-weight:800;font-size:20px}nav a{color:#cbd5e1;text-decoration:none;margin-left:16px}nav a.active{color:#fff;text-decoration:underline}`]
})
export class NavbarComponent {}
