import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  error = signal('');
  ok = signal('');
  loading = signal(false);
  username = signal('');
  password = signal('');
  confirmPassword = signal('');
  passwordStrength = signal<'weak' | 'medium' | 'strong' | ''>('');

  constructor(private auth: AuthService, public router: Router) {}

  updateUsername(event: any) {
    this.username.set(event.target.value);
  }

  updatePassword(event: any) {
    this.password.set(event.target.value);
    this.checkPasswordStrength();
  }

  updateConfirmPassword(event: any) {
    this.confirmPassword.set(event.target.value);
  }

  validatePassword(pwd: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Pelo menos 1 letra minúscula');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Pelo menos 1 letra MAIÚSCULA');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Pelo menos 1 número');
    }
    
    return { valid: errors.length === 0, errors };
  }

  checkPasswordStrength() {
    const pwd = this.password();
    if (!pwd) {
      this.passwordStrength.set('');
      return;
    }
    
    const validation = this.validatePassword(pwd);
    if (!validation.valid) {
      this.passwordStrength.set('weak');
    } else if (pwd.length >= 12) {
      this.passwordStrength.set('strong');
    } else {
      this.passwordStrength.set('medium');
    }
  }

  async submit() {
    this.error.set('');
    this.ok.set('');

    if (!this.username() || !this.password() || !this.confirmPassword()) {
      this.error.set('Preencha todos os campos');
      return;
    }

    if (this.username().length < 3) {
      this.error.set('Usuário deve ter no mínimo 3 caracteres');
      return;
    }

    const pwdValidation = this.validatePassword(this.password());
    if (!pwdValidation.valid) {
      this.error.set('Senha fraca. Requisitos: ' + pwdValidation.errors.join(', '));
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Senhas não coincidem');
      return;
    }

    this.loading.set(true);
    const res = await this.auth.register(this.username(), this.password());
    this.loading.set(false);

    if (res.ok) {
      this.ok.set('✓ Registrado com sucesso! Redirecionando...');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } else {
      this.error.set(res.message || 'Erro ao registrar');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
