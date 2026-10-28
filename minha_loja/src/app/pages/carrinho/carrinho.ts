
import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho';
import { PedidosService, Pedido } from '../../services/pedidos';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  mensagem = '';

  constructor(
    public carrinhoService: CarrinhoService,
    private pedidosService: PedidosService
  ) {}

  get itens() {
    return this.carrinhoService.itens;
  }

  get total(): number {
    return this.carrinhoService.total;
  }

  aumentarQuantidade(id: number): void {
    this.carrinhoService.aumentarQuantidade(id);
  }

  diminuirQuantidade(id: number): void {
    this.carrinhoService.diminuirQuantidade(id);
  }

  removerItem(id: number): void {
    this.carrinhoService.removerItem(id);
  }

  finalizarCompra(): void {
    if (this.itens.length === 0) {
      this.mensagem = 'Seu carrinho está vazio.';
      return;
    }

    const pedido: Pedido = {
      id: Date.now(),
      data: new Date().toISOString(),
      itens: this.itens.map(item => ({ ...item })),
      total: this.total,
      status: 'Aguardando confirmação'
    };

    this.pedidosService.adicionarPedido(pedido);
    this.carrinhoService.limparCarrinho();

    this.mensagem = `Pedido nº ${pedido.id} criado com sucesso!`;
  }
}
