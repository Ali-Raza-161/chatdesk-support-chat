import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink],
  template: `<section class="hero"><h1>Business support, answered live.</h1>
  <p>ChatDesk is a company website with a live chat widget for visitors and a dashboard for the support team — built with Angular, Node.js, Socket.IO and MongoDB.</p>
  <a class="btn" routerLink="/services">Our services</a> <a class="btn outline" routerLink="/contact">Contact us</a></section>
  <section class="grid"><div class="card"><h3>Live chat</h3><p>Visitors start a chat from the bottom-right widget. Messages arrive in real time.</p></div>
  <div class="card"><h3>Admin dashboard</h3><p>The support team sees every active chat, unread counts and full history.</p></div>
  <div class="card"><h3>Real-time, honestly</h3><p>Socket.IO powers typing indicators and instant replies — not a fake mock chat.</p></div></section>`,
  styles: [`.hero{padding:48px 24px;text-align:center}.hero h1{font-size:40px;margin-bottom:12px}.btn{display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;margin:6px}.btn.outline{background:#fff;color:#2563eb;border:1px solid #2563eb}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:0 24px}.card{border:1px solid #e2e8f0;border-radius:16px;padding:18px}`]
})
export class HomeComponent {}
