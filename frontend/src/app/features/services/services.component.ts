import { Component } from '@angular/core';
@Component({
  selector: 'app-services', standalone: true,
  template: `<section class="page"><h1>Services</h1><ul>
  <li><strong>Live chat support</strong> — instant answers for website visitors.</li>
  <li><strong>Ticket-style history</strong> — every conversation is saved and searchable by the team.</li>
  <li><strong>Team dashboard</strong> — one place to see open chats and reply.</li></ul>
  <p>Prices are illustrative for this portfolio demo; the demo backend does not process payments.</p></section>`,
  styles: [`.page{padding:32px 24px;max-width:800px;margin:0 auto}.page li{margin:10px 0}`]
})
export class ServicesComponent {}
