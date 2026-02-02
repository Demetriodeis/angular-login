import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Layout } from './core/layout/layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Layout, RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gerenciador-financeiro');

  constructor(public router: Router) {}

  isAuthRoute(): boolean {
    const currentRoute = this.router.url;
    return !currentRoute.startsWith('/login') && !currentRoute.startsWith('/signup');
  }
}
