import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

type CardType = 'income' | 'outcome' | 'balance';
type ValueCssClass = 'balance-card-income' | 'balance-card-outcome' | 'balance-card-balance';

@Component({
  selector: 'app-balance-card',
  imports: [MatCardModule],
  templateUrl: './balance-card.html',
  styleUrl: './balance-card.scss',
})
export class BalanceCard {
  type = input.required<CardType>();
  label = input.required<string>();
  amount = input.required<number>();

  cssClass = computed<ValueCssClass>(() => {
    if (this.type() === 'balance' && this.amount() >= 0) {
      return 'balance-card-income';
    }
    return {
      income: 'balance-card-income',
      outcome: 'balance-card-outcome',
      balance: 'balance-card-outcome',
    }[this.type()] as ValueCssClass;
  });
}
