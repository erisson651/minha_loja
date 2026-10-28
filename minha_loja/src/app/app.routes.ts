
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio)
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./pages/produtos/produtos').then(m => m.Produtos)
  },
  {
    path: 'servicos',
    loadComponent: () =>
      import('./pages/servicos/servicos').then(m => m.Servicos)
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes').then(m => m.Clientes)
  },

  
{
  path: 'funcionarios',
  loadComponent: () =>
    import('./pages/funcionarios/funcionarios')
      .then(m => m.Funcionarios)
},

  {
    path: 'carrinho',
    loadComponent: () =>
      import('./pages/carrinho/carrinho').then(m => m.Carrinho)
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pages/pedidos/pedidos').then(m => m.Pedidos)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.Admin)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
