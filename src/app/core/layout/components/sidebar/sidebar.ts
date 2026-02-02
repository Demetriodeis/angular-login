import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  menuOpen = false;

  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/', exact: true },
    { label: 'Lançamentos', icon: '💸', route: '/lancamentos' },
    { label: 'Categorias', icon: '🏷️', route: '/categorias' },
    { label: 'Relatórios', icon: '📈', route: '/relatorios' },
  ];

  constructor(public router: Router, public auth: AuthService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  isActive(route: string, exact?: boolean): boolean {
    if (exact) return this.router.url === route;
    return this.router.url.startsWith(route) && route !== '/';
  }

  getUserInitial(): string {
    const username = this.auth.user()?.username;
    return username ? username.charAt(0).toUpperCase() : '?';
  }
}
