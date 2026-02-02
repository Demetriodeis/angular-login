import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'outcome';
  categoryId?: string | null;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  transactions = signal<Transaction[]>([]);
  categories = signal<{ id: string; name: string }[]>([]);
  loading = signal(false);
  private apiBase = 'http://localhost:3001';

  constructor(private auth: AuthService) {}

  async loadTransactions(): Promise<void> {
    this.loading.set(true);
    try {
      const token = this.auth.getToken();
      if (!token) {
        this.transactions.set([]);
        return;
      }

      const res = await fetch(`${this.apiBase}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        this.transactions.set(data.transactions || []);
      } else {
        this.transactions.set([]);
      }
    } catch (e) {
      console.error('Load transactions error:', e);
      this.transactions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const token = this.auth.getToken();
      if (!token) {
        this.categories.set([]);
        return;
      }

      const res = await fetch(`${this.apiBase}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        this.categories.set(data.categories || []);
      } else {
        this.categories.set([]);
      }
    } catch (e) {
      console.error('Load categories error:', e);
      this.categories.set([]);
    }
  }

  async addTransaction(description: string, amount: number, type: 'income' | 'outcome', categoryId?: string | null): Promise<boolean> {
    try {
      const token = this.auth.getToken();
      if (!token) return false;

      const res = await fetch(`${this.apiBase}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description, amount, type, categoryId: categoryId || null, date: new Date().toISOString() })
      });

      if (res.ok) {
        const transaction = await res.json();
        const current = this.transactions();
        this.transactions.set([...current, transaction]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Add transaction error:', e);
      return false;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const token = this.auth.getToken();
      if (!token) return false;

      const res = await fetch(`${this.apiBase}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const current = this.transactions();
        this.transactions.set(current.filter(t => t.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Delete transaction error:', e);
      return false;
    }
  }

  async addCategory(name: string): Promise<boolean> {
    try {
      const token = this.auth.getToken();
      if (!token) return false;

      const res = await fetch(`${this.apiBase}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        const cat = await res.json();
        const current = this.categories();
        this.categories.set([...current, cat]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Add category error:', e);
      return false;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const token = this.auth.getToken();
      if (!token) return false;

      const res = await fetch(`${this.apiBase}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const current = this.categories();
        this.categories.set(current.filter(c => c.id !== id));
        await this.loadTransactions();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Delete category error:', e);
      return false;
    }
  }

  async updateTransaction(id: string, description: string, amount: number, type: 'income' | 'outcome', categoryId?: string | null): Promise<boolean> {
    try {
      const token = this.auth.getToken();
      if (!token) return false;

      const res = await fetch(`${this.apiBase}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description, amount, type, categoryId: categoryId || null })
      });

      if (res.ok) {
        const updated = await res.json();
        const current = this.transactions();
        const idx = current.findIndex(t => t.id === id);
        if (idx !== -1) {
          current[idx] = updated;
          this.transactions.set([...current]);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Update transaction error:', e);
      return false;
    }
  }

  getTotalIncome(): number {
    return this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalOutcome(): number {
    return this.transactions()
      .filter(t => t.type === 'outcome')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalOutcome();
  }
}
