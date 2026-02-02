import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Balance } from "./components/balance/balance";
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [Balance, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  description = signal('');
  amount = signal('');
  type = signal<'income' | 'outcome'>('outcome');
  submitting = signal(false);
  error = signal('');
  editingId = signal<string | null>(null);
  
  constructor(
    public transactionService: TransactionService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.transactionService.loadTransactions();
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

  startEdit(transaction: any) {
    this.editingId.set(transaction.id);
    this.description.set(transaction.description);
    this.amount.set(transaction.amount.toString());
    this.type.set(transaction.type);
    this.error.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.description.set('');
    this.amount.set('');
    this.type.set('outcome');
    this.error.set('');
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
        this.type()
      );
    } else {
      ok = await this.transactionService.addTransaction(
        this.description(),
        amountValue,
        this.type()
      );
    }

    this.submitting.set(false);

    if (ok) {
      this.description.set('');
      this.amount.set('');
      this.type.set('outcome');
      this.editingId.set(null);
    } else {
      this.error.set('Erro ao salvar transação');
    }
  }

  async deleteTransaction(id: string) {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      await this.transactionService.deleteTransaction(id);
    }
  }
}
