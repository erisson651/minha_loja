
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho';
import { AdministracaoService, Cliente } from '../../services/administracao';
import { AtendimentoService } from '../../services/atendimento';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  mensagem = '';
  finalizando = false;
  cliente: Cliente | null = null;
  clientes: Cliente[] = [];
  carregandoCliente = true;
  erroCliente = '';

  constructor(
    public carrinhoService: CarrinhoService,
    private atendimento: AtendimentoService,
    private cdr: ChangeDetectorRef,
    private administracao: AdministracaoService
  ) {
    afterNextRender(() => this.carregarClientes());
  }

  private carregarClientes(): void {
    const idCliente = Number(sessionStorage.getItem('idCliente'));

    this.administracao.listarClientes().subscribe({
      next: clientes => {
        this.clientes = clientes;
        this.cliente = clientes.find(cliente => cliente.idPessoa === idCliente) ?? null;
        this.carregandoCliente = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erroCliente = 'Não foi possível carregar os clientes da API.';
        this.carregandoCliente = false;
        this.cdr.markForCheck();
      }
    });
  }

  selecionarCliente(id: number | null): void {
    this.cliente = this.clientes.find(cliente => cliente.idPessoa === id) ?? null;
    this.mensagem = '';

    if (this.cliente) {
      sessionStorage.setItem('idCliente', String(this.cliente.idPessoa));
    } else {
      sessionStorage.removeItem('idCliente');
    }
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
