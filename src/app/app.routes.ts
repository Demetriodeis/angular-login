import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup').then(m => m.Signup)
  },
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard]
  },
  {
    path: 'lancamentos',
    loadComponent: () => import('./features/lancamentos/lancamentos').then(m => m.Lancamentos),
    canActivate: [AuthGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categorias/categorias').then(m => m.Categorias),
    canActivate: [AuthGuard]
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./features/relatorios/relatorios').then(m => m.Relatorios),
    canActivate: [AuthGuard]
  }
];
