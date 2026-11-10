import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { AdministracaoService } from '../../services/administracao';
import { Pedido } from '../../services/pedidos';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos {
  pedidos: Pedido[] = [];
  mensagem = '';
  carregando = true;

  constructor(
    private api: AdministracaoService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.carregarPedidos());
  }

  private carregarPedidos(): void {
    const idCliente = Number(sessionStorage.getItem('idCliente'));
    if (!Number.isSafeInteger(idCliente) || idCliente <= 0) {
      this.mensagem = 'Cliente não identificado. Faça seu cadastro nesta aba.';
      this.carregando = false;
      this.cdr.markForCheck();
      return;
    }

    this.api.listarPedidos().pipe(
      switchMap(pedidos => {
        const consultas = pedidos
          .filter(pedido => Number(pedido.idpessoas) === idCliente)
          .map(pedido => this.api.buscarPedido(pedido.idatendimento));

        return consultas.length ? forkJoin(consultas) : of([]);
      })
    ).subscribe({
      next: pedidos => {
        this.pedidos = pedidos.map(pedido => {
          const itens = (pedido.atendimentoitems ?? []).map(item => ({
            id: item.iditem,
            nome: item.iditemNavigation?.item1 ?? 'Item',
            preco: item.valorunitarioEntrada,
            quantidade: item.quantidadeItens
          }));

          return {
            id: pedido.idatendimento,
            data: pedido.dataAtendimento,
            status: pedido.statusAtendimento === 'A' ? 'Aberto' :
              pedido.statusAtendimento === 'F' ? 'Finalizado' : pedido.statusAtendimento,
            itens,
            total: itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
          };
        }).sort((a, b) => b.id - a.id);

        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar os pedidos da API.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
