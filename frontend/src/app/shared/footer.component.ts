import { Component } from '@angular/core';
@Component({
  selector: 'app-footer', standalone: true,
  template: `<footer class="foot"><p>ChatDesk — a portfolio demo for business live-chat support. No real support team is behind this demo.</p></footer>`,
  styles: [`.foot{padding:20px;text-align:center;color:#64748b;border-top:1px solid #e2e8f0;margin-top:40px}`]
})
export class FooterComponent {}
