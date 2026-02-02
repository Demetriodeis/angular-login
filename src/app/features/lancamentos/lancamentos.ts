import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lancamentos.html',
  styleUrl: './lancamentos.scss',
})
export class Lancamentos implements OnInit {
  description = signal('');
  amount = signal('');
  type = signal<'income' | 'outcome'>('outcome');
  categoryId = signal<string | null>(null);
  submitting = signal(false);
  error = signal('');
  editingId = signal<string | null>(null);

  constructor(
    public transactionService: TransactionService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.transactionService.loadTransactions();
    this.transactionService.loadCategories();
  }

  updateDescription(event: any) {
    this.description.set(event.target.value);
  }

  updateAmount(event: any) {
    this.amount.set(event.target.value);
  }

  updateType(event: any) {
    this.type.set(event.target.value);
  }

  updateCategory(event: any) {
    const v = event?.target?.value;
    this.categoryId.set(v || null);
  }

  async submitTransaction() {
    this.error.set('');
    
    if (!this.description() || !this.amount()) {
      this.error.set('Preencha descrição e valor');
      return;
    }

    const amountValue = parseFloat(this.amount());
    if (isNaN(amountValue) || amountValue <= 0) {
      this.error.set('Valor deve ser um número positivo');
      return;
    }

    this.submitting.set(true);
    let ok = false;

    if (this.editingId()) {
      ok = await this.transactionService.updateTransaction(
        this.editingId()!,
        this.description(),
        amountValue,
        this.type(),
        this.categoryId()
      );
    } else {
      ok = await this.transactionService.addTransaction(
        this.description(),
        amountValue,
        this.type(),
        this.categoryId()
      );
    }

    this.submitting.set(false);

    if (ok) {
      this.description.set('');
      this.amount.set('');
      this.type.set('outcome');
      this.categoryId.set(null);
      this.editingId.set(null);
    } else {
      this.error.set('Erro ao salvar transação');
    }
  }

  startEdit(transaction: any) {
    this.editingId.set(transaction.id);
    this.description.set(transaction.description);
    this.amount.set(transaction.amount.toString());
    this.type.set(transaction.type);
    this.categoryId.set(transaction.categoryId ?? null);
    this.error.set('');
  }

  getCategoryName(categoryId?: string | null): string {
    if (!categoryId) return 'Sem categoria';
    const cat = this.transactionService.categories().find(c => c.id === categoryId);
    return cat ? cat.name : 'Sem categoria';
  }

  getCategoryColor(categoryId?: string | null): string {
    if (!categoryId) return '#9e9e9e';
    const categories = this.transactionService.categories();
    const idx = categories.findIndex(c => c.id === categoryId);
    const palette = ['#4caf50','#2196f3','#ff9800','#9c27b0','#f44336','#3f51b5','#009688','#ffc107'];
    if (idx === -1) return '#9e9e9e';
    return palette[idx % palette.length];
  }

  cancelEdit() {
    this.editingId.set(null);
    this.description.set('');
    this.amount.set('');
    this.type.set('outcome');
    this.categoryId.set(null);
    this.error.set('');
  }

  async deleteTransaction(id: string) {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      await this.transactionService.deleteTransaction(id);
    }
  }
}
