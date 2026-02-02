import { Component, computed, input } from '@angular/core';
import { BalanceCard } from './balance-card/balance-card';

@Component({
  selector: 'app-balance',
  imports: [BalanceCard],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class Balance {
  transactions = input.required<{ amount: number; type: string }[]>();

  totalIcomes = computed(() => {
    return this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  totalOutcomes = computed(() => {
    return this.transactions()
      .filter((t) => t.type === 'outcome')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  totalBalance = computed(() => {
    return this.totalIcomes() - this.totalOutcomes();
  });
}
