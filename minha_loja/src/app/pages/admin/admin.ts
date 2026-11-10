import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';

import { AdministracaoService, Cliente, Entrada, Estoque, PedidoApi } from '../../services/administracao';
import { Catalogo, Categoria } from '../../services/catalogo';

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html'
})
export class Admin {
  clientes: Cliente[] = [];
  categorias: Categoria[] = [];
  categoria = { idcategoria: 0, categoria: '' };
  idCategoria: number | null = null;
  mensagemCategoria = '';
  operandoCategoria = false;
  pedidos: PedidoApi[] = [];
  estoque: Estoque[] = [];

  produtos: number | null = null;
  servicos: number | null = null;
  status = '';
  idCliente: number | null = null;
  idPedido: number | null = null;
  idEstoque: number | null = null;
  cliente: Cliente | null = null;
  pedido: PedidoApi | null = null;
  erros: Record<string, string> = {};
  mensagemEntrada = '';
  mensagemPedido = '';
  finalizandoPedido = false;
  salvando = false;
  entrada: Entrada = {
    iditem: 0,
    dataEntradaProduto: '',
    quantidadeEntrada: 1,
    unidade: '',
    valorUnitarioEntrada: 0
  };

  constructor(
    private api: AdministracaoService,
    private catalogo: Catalogo,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.consultar('clientes', this.api.listarClientes(), dados => this.clientes = dados);
      this.consultar('pedidos', this.api.listarPedidos(), dados => this.pedidos = dados);
      this.consultar('produtos', this.catalogo.listarItens(), dados => this.produtos = dados.length);
      this.consultar('serviços', this.catalogo.listarServicos(), dados => this.servicos = dados.length);
      this.carregarEstoque();
      this.carregarCategorias();
    });
  }

  get pedidosFiltrados() {
    return this.pedidos.filter(pedido => !this.status || pedido.statusAtendimento === this.status);
  }

  get estoqueFiltrado() {
    return this.estoque.filter(item => this.idEstoque === null || item.iditem === this.idEstoque);
  }

  buscarCliente(): void {
    const id = this.idCliente ?? 0;
    this.cliente = null;

    if (!Number.isInteger(id) || id <= 0) {
      this.erros['cliente'] = 'Informe um ID de cliente válido.';
      return;
    }

    this.consultar('cliente', this.api.buscarCliente(id), dados => this.cliente = dados);
  }

  buscarPedido(): void {
    const id = this.idPedido ?? 0;
    this.pedido = null;
    this.mensagemPedido = '';

    if (!Number.isInteger(id) || id <= 0) {
      this.erros['pedido'] = 'Informe um ID de pedido válido.';
      return;
    }

    this.consultar('pedido', this.api.buscarPedido(id), dados => this.pedido = dados);
  }

  finalizarPedido(pedido: PedidoApi): void {
    if (this.finalizandoPedido || pedido.statusAtendimento !== 'A') {
      return;
    }

    this.finalizandoPedido = true;
    this.mensagemPedido = '';
    this.api.finalizarPedido(pedido.idatendimento).pipe(
      finalize(() => {
        this.finalizandoPedido = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        pedido.statusAtendimento = 'F';
        const registro = this.pedidos.find(item => item.idatendimento === pedido.idatendimento);

        if (registro) {
          registro.statusAtendimento = 'F';
        }

        this.mensagemPedido = 'Pedido finalizado com sucesso.';
      },
      error: erro => {
        this.mensagemPedido = erro.error?.mensagem
          || 'Não foi possível finalizar o pedido.';
      }
    });
  }

  registrarEntrada(): void {
    const entrada = this.entrada;
    const produto = this.estoque.find(item => item.iditem === entrada.iditem);

    if (this.salvando) {
      return;
    }

    if (!produto || !entrada.dataEntradaProduto || !produto.unidade ||
        !Number.isInteger(entrada.quantidadeEntrada) || entrada.quantidadeEntrada <= 0 ||
        !Number.isFinite(entrada.valorUnitarioEntrada) || entrada.valorUnitarioEntrada <= 0) {
      this.mensagemEntrada = 'Informe o produto, a data, a quantidade inteira e o valor unitário positivo.';
      return;
    }

    this.salvando = true;
    this.mensagemEntrada = '';
    this.api.registrarEntrada({ ...entrada, unidade: produto.unidade }).pipe(
      finalize(() => {
        this.salvando = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.mensagemEntrada = 'Entrada registrada com sucesso.';
        this.carregarEstoque();
      },
      error: erro => {
        this.mensagemEntrada = typeof erro.error === 'string' && erro.error
          ? erro.error : 'Não foi possível registrar a entrada.';
      }
    });
  }

  consultarCategoria(id: number | null): void {
    if (!id || !Number.isSafeInteger(id) || id <= 0) {
      this.mensagemCategoria = 'Informe um ID de categoria válido.';
      return;
    }

    this.alterarCategoria(this.catalogo.buscarCategoria(id), categoria => {
      this.categoria = categoria;
      this.idCategoria = id;
    });
  }

  salvarCategoria(): void {
    const categoria = this.categoria.categoria.trim();

    if (!categoria) {
      this.mensagemCategoria = 'Informe o nome da categoria.';
      return;
    }

    const editando = this.categoria.idcategoria > 0;
    this.alterarCategoria(
      this.catalogo.salvarCategoria({ ...this.categoria, categoria }),
      () => {
        this.mensagemCategoria = editando ? 'Categoria atualizada.' : 'Categoria cadastrada.';
        this.limparCategoria();
        this.carregarCategorias();
      }
    );
  }

  excluirCategoria(): void {
    const id = this.categoria.idcategoria;
    if (!id || this.operandoCategoria ||
        !window.confirm('Excluir definitivamente a categoria selecionada?')) {
      return;
    }

    this.alterarCategoria(this.catalogo.excluirCategoria(id), () => {
      this.mensagemCategoria = 'Categoria excluída.';
      this.limparCategoria();
      this.carregarCategorias();
    }, 'Não foi possível excluir. Confira se a categoria está vinculada a algum item.');
  }

  limparCategoria(): void {
    this.categoria = { idcategoria: 0, categoria: '' };
    this.idCategoria = null;
  }

  private carregarCategorias(): void {
    this.consultar('categorias', this.catalogo.listarCategorias(), dados => this.categorias = dados);
  }

  private alterarCategoria<T>(
    consulta: Observable<T>,
    receber: (dados: T) => void,
    mensagemErro = 'Não foi possível concluir a operação da categoria.'
  ): void {
    if (this.operandoCategoria) {
      return;
    }

    this.operandoCategoria = true;
    this.mensagemCategoria = '';
    consulta.pipe(finalize(() => {
      this.operandoCategoria = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: receber,
      error: erro => {
        this.mensagemCategoria = erro.status === 404 ? 'Categoria não encontrada.' : mensagemErro;
      }
    });
  }

  private carregarEstoque(): void {
    this.consultar('estoque', this.api.listarEstoque(), dados => this.estoque = dados);
  }

  private consultar<T>(recurso: string, consulta: Observable<T>, receber: (dados: T) => void): void {
    this.erros[recurso] = '';
    consulta.subscribe({
      next: dados => {
        receber(dados);
        this.cdr.markForCheck();
      },
      error: erro => {
        this.erros[recurso] = erro.status === 404
          ? 'Registro não encontrado.'
          : 'Não foi possível consultar ' + recurso + '.';
        this.cdr.markForCheck();
      }
    });
  }
}
