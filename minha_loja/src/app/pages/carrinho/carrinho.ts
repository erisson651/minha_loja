
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho';
import { AdministracaoService, Cliente } from '../../services/administracao';
import { AtendimentoService } from '../../services/atendimento';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  mensagem = '';
  finalizando = false;
  cliente: Cliente | null = null;
  carregandoCliente = true;
  erroCliente = '';

  constructor(
    public carrinhoService: CarrinhoService,
    private atendimento: AtendimentoService,
    private cdr: ChangeDetectorRef,
    private administracao: AdministracaoService
  ) {
    afterNextRender(() => this.carregarCliente());
  }

  private carregarCliente(): void {
    const idCliente = Number(sessionStorage.getItem('idCliente'));

    if (!Number.isSafeInteger(idCliente) || idCliente <= 0) {
      this.carregandoCliente = false;
      this.cdr.markForCheck();
      return;
    }

    this.administracao.buscarCliente(idCliente).subscribe({
      next: cliente => {
        this.cliente = cliente;
        this.carregandoCliente = false;
        this.cdr.markForCheck();
      },
      error: erro => {
        this.erroCliente = erro.status === 404
          ? 'Cliente não encontrado. Faça seu cadastro.'
          : 'Não foi possível consultar o cliente da compra.';
        this.carregandoCliente = false;
        this.cdr.markForCheck();
      }
    });
  }

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
    if (this.finalizando) {
      return;
    }

    if (this.itens.length === 0) {
      this.mensagem = 'Seu carrinho está vazio.';
      return;
    }

    if (!this.cliente) {
      this.mensagem = 'Identifique o cliente antes de finalizar.';
      return;
    }

    this.finalizando = true;
    this.mensagem = '';
    this.atendimento.finalizarCompra({
      idpessoas: this.cliente.idPessoa,
      idfuncionario: 1,
      itens: this.itens.map(item => ({
        iditem: item.id,
        quantidadeItens: item.quantidade
      }))
    }).subscribe({
      next: resposta => {
        this.carrinhoService.limparCarrinho();
        this.mensagem = resposta.mensagem;
        this.finalizando = false;
        this.cdr.markForCheck();
      },
      error: erro => {
        this.mensagem = typeof erro.error === 'string' && erro.error
          ? erro.error
          : erro.error?.detalhe || erro.error?.mensagem || 'Não foi possível finalizar a compra.';
        this.finalizando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
