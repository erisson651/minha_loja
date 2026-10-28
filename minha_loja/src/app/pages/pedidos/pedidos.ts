
import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PedidosService } from '../../services/pedidos';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos {
  constructor(public pedidosService: PedidosService) {}

  get pedidos() {
    return this.pedidosService.pedidos;
  }
}
