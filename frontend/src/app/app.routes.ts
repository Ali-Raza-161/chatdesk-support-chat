import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ServicesComponent } from './features/services/services.component';
import { AboutComponent } from './features/about/about.component';
import { ContactComponent } from './features/contact/contact.component';
import { AdminLoginComponent } from './features/admin/login/login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AdminChatWindowComponent } from './features/admin/chat-window/chat-window.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/chat/:id', component: AdminChatWindowComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
