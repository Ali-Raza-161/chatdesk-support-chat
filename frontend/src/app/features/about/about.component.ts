import { Component } from '@angular/core';
@Component({
  selector: 'app-about', standalone: true,
  template: `<section class="page"><h1>About ChatDesk</h1>
  <p>ChatDesk was built as a portfolio project to show a complete full-stack flow: a public Angular website, a real-time chat widget, a JWT-protected admin dashboard, and a Node.js + Socket.IO backend with MongoDB (or an in-memory fallback for demos).</p>
  <p>It is a demo, not a real company. No real support team, users or payments are involved.</p></section>`,
  styles: [`.page{padding:32px 24px;max-width:800px;margin:0 auto}`]
})
export class AboutComponent {}
