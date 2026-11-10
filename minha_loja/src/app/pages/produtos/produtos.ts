
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../services/catalogo';
import { AdministracaoService } from '../../services/administracao';
import { CarrinhoService } from '../../services/carrinho';
@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos {
  pesquisa: string = '';
  categoriaSelecionada: string = 'Todas';
  mensagem: string = '';

  produtos: { id: number; nome: string; descricao: string; categoria: string; preco: number; estoque: number }[] = [];
  carregando = true;

  constructor(
    private carrinhoService: CarrinhoService,
    private catalogo: Catalogo,
    private api: AdministracaoService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.carregarProdutos());
  }

  private carregarProdutos(): void {
    forkJoin({
      produtos: this.catalogo.listarItens(),
      categorias: this.catalogo.listarCategorias(),
      estoque: this.api.listarEstoque()
    }).subscribe({
      next: ({ produtos, categorias, estoque }) => {
        this.produtos = produtos
          .filter(produto => produto.iditemNavigation?.ativoProdutoServico === 'S')
          .map(produto => ({
            id: produto.iditem,
            nome: produto.iditemNavigation.item1,
            descricao: produto.iditemNavigation.descricaoItem,
            categoria: categorias.find(categoria =>
              categoria.idcategoria === produto.iditemNavigation.idcategoria)?.categoria ?? '',
            preco: Number(produto.precoVenda),
            estoque: estoque.find(item => item.iditem === produto.iditem)?.quantidadeEstoque ?? 0
          }));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Não foi possível consultar os produtos, categorias ou estoque.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get categorias(): string[] {
    return [...new Set(this.produtos.map(produto => produto.categoria).filter(Boolean))];
  }

  get produtosFiltrados() {
    return this.produtos.filter(produto => {
      const correspondeNome = produto.nome
        .toLowerCase()
        .includes(this.pesquisa.toLowerCase());

      const correspondeCategoria =
        this.categoriaSelecionada === 'Todas' ||
        produto.categoria === this.categoriaSelecionada;

      return correspondeNome && correspondeCategoria;
    });
  }

  adicionarAoCarrinho(id: number) {
    const produto = this.produtos.find(item => item.id === id);

    if (!produto || produto.estoque <= 0) {
      return;
    }

    this.carrinhoService.adicionarItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco
    });

    this.mensagem = `${produto.nome} foi adicionado ao carrinho!`;
  }
}
