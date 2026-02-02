import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  private tokenKey = 'auth_token';
  private apiBase = 'http://localhost:3001';

  constructor(private router: Router) {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const parts = token.split(':');
      this.user.set({ username: parts[1] ?? 'user' });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(this.tokenKey, data.token);
        this.user.set({ username });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  }

  async register(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch(`${this.apiBase}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) return { ok: true };
      const data = await res.json();
      
      // Check for duplicate user error (409 status)
      if (res.status === 409) {
        return { ok: false, message: 'Este usuário já está registrado' };
      }
      
      return { ok: false, message: data?.message };
    } catch (e) {
      return { ok: false, message: 'Erro de conexão com servidor' };
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
  }
}
