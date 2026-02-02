import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  constructor(public transactionService: TransactionService) {}

  getTotalIncome(): number {
    return this.transactionService.getTotalIncome();
  }

  getTotalOutcome(): number {
    return this.transactionService.getTotalOutcome();
  }

  getBalance(): number {
    return this.transactionService.getBalance();
  }
}
