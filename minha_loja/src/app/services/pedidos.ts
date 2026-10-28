
import { Injectable } from '@angular/core';

export interface ItemPedido {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Pedido {
  id: number;
  data: string;
  itens: ItemPedido[];
  total: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  pedidos: Pedido[] = [];

  adicionarPedido(pedido: Pedido): void {
    this.pedidos.push(pedido);
  }

  buscarPedido(id: number): Pedido | undefined {
    return this.pedidos.find(pedido => pedido.id === id);
  }
}
