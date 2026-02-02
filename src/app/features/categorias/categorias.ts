import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})

export class Categorias {
  name = signal('');
  error = signal('');

  constructor(public service: TransactionService) {
    this.service.loadCategories();
  }

  async add() {
    const n = this.name().trim();
    this.error.set('');
    if (!n) {
      this.error.set('Informe um nome para a categoria');
      return;
    }
    // duplicate check (case-insensitive)
    const exists = this.service.categories().some(c => c.name.toLowerCase() === n.toLowerCase());
    if (exists) {
      this.error.set('Categoria já existe');
      return;
    }
    const ok = await this.service.addCategory(n);
    if (ok) this.name.set('');
  }

  async remove(id: string) {
    if (!confirm('Remover categoria?')) return;
    await this.service.deleteCategory(id);
  }
}
