import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  error = '';
  loading = signal(false);
  username = signal('');
  password = signal('');

  constructor(private auth: AuthService, public router: Router) {}

  updateUsername(event: any) {
    this.username.set(event.target.value);
  }

  updatePassword(event: any) {
    this.password.set(event.target.value);
  }

  async submit() {
    this.error = '';
    if (!this.username() || !this.password()) {
      this.error = 'Preencha usuário e senha';
      return;
    }
    this.loading.set(true);
    const ok = await this.auth.login(this.username(), this.password());
    this.loading.set(false);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.error = 'Usuário ou senha incorretos. Registre-se se não tem conta.';
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
