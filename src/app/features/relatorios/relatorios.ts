import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relatorios-container">
      <h1>Relatórios</h1>
      <div class="coming-soon">
        <div class="icon">📊</div>
        <h2>Em Breve</h2>
        <p>Página de relatórios em desenvolvimento</p>
      </div>
    </div>
  `,
  styles: [`
    .relatorios-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;

      h1 {
        color: #1a237e;
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 300;
      }
    }

    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 20px;
      text-align: center;

      .icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }

      h2 {
        color: #283593;
        font-size: 1.8rem;
        margin-bottom: 10px;
      }

      p {
        color: #666;
        font-size: 1.1rem;
      }
    }
  `]
})
export class Relatorios {}
