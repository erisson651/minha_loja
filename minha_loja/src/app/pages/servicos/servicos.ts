
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Catalogo } from '../../services/catalogo';
import { CarrinhoService } from '../../services/carrinho';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css'
})
export class Servicos {
  pesquisa: string = '';
  categoriaSelecionada: string = 'Todas';

  servicos: { id: number; nome: string; descricao: string; idcategoria: number; preco: number }[] = [];
  categorias: { idcategoria: number; categoria: string }[] = [];
  mensagem = '';
  erroCategorias = '';
  erroServicos = '';
  carregando = true;
  salvando = false;
  aba: 'catalogo' | 'cadastro' = 'catalogo';
  cadastro = { idcategoria: 0, nome: '', descricao: '', preco: null as number | null };

  constructor(
    private catalogo: Catalogo,
    private carrinho: CarrinhoService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.carregarCategorias();
      this.carregarServicos();
    });
  }

  get nomesCategorias(): string[] {
    const nomes = this.servicos.map(servico => this.nomeCategoria(servico.idcategoria));
    return [...new Set(nomes.filter(Boolean))];
  }

  nomeCategoria(id: number): string {
    return this.categorias.find(categoria => categoria.idcategoria === id)?.categoria ?? '';
  }

  private carregarCategorias(): void {
    this.catalogo.listarCategorias().subscribe({
      next: categorias => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erroCategorias = 'Não foi possível carregar as categorias.';
        this.cdr.markForCheck();
      }
    });
  }

  private carregarServicos(): void {
    this.carregando = true;
    this.erroServicos = '';
    this.catalogo.listarServicos().subscribe({
      next: servicos => {
        this.servicos = servicos
          .filter(servico => servico.ativoProdutoServico === 'S')
          .map(servico => ({
            id: servico.iditem,
            nome: servico.item1,
            descricao: servico.descricaoItem,
            idcategoria: servico.idcategoria,
            preco: Number(servico.preco)
          }));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erroServicos = 'Não foi possível carregar os serviços.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  cadastrarServico(): void {
    if (this.salvando) {
      return;
    }

    const { idcategoria, nome, descricao, preco } = this.cadastro;
    if (!this.categorias.some(categoria => categoria.idcategoria === idcategoria)
        || !nome.trim() || !descricao.trim()
        || preco === null || !Number.isFinite(preco) || preco <= 0) {
      this.mensagem = 'Informe categoria, nome, descrição e um preço maior que zero.';
      return;
    }

    this.salvando = true;
    this.mensagem = '';
    this.catalogo.cadastrarServico({
      idcategoria,
      item1: nome.trim(),
      descricaoItem: descricao.trim(),
      preco
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.cadastro = { idcategoria: 0, nome: '', descricao: '', preco: null };
        this.pesquisa = '';
        this.categoriaSelecionada = 'Todas';
        this.aba = 'catalogo';
        this.mensagem = 'Serviço cadastrado com sucesso!';
        this.carregarServicos();
        this.cdr.markForCheck();
      },
      error: erro => {
        this.salvando = false;
        this.mensagem = typeof erro.error === 'string' && erro.error
          ? erro.error : 'Não foi possível cadastrar o serviço.';
        this.cdr.markForCheck();
      }
    });
  }

  get servicosFiltrados() {
    return this.servicos.filter(servico => {
      const correspondeNome = servico.nome
        .toLowerCase()
        .includes(this.pesquisa.toLowerCase());

      const correspondeCategoria =
        this.categoriaSelecionada === 'Todas' ||
        this.nomeCategoria(servico.idcategoria) === this.categoriaSelecionada;

      return correspondeNome && correspondeCategoria;
    });
  }

  adicionarAoCarrinho(servico: { id: number; nome: string; preco: number }): void {
    this.carrinho.adicionarItem({ id: servico.id, nome: servico.nome, preco: servico.preco });
    this.mensagem = servico.nome + ' adicionado ao carrinho!';
  }
}
