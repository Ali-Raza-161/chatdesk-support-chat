import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { FooterComponent } from './shared/footer.component';
import { ChatWidgetComponent } from './features/chat-widget/chat-widget.component';

@Component({
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatWidgetComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
