
import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
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

  servicos: { id: number; nome: string; descricao: string; categoria: string; preco: number }[] = [];
  categorias: string[] = [];
  mensagem = '';
  carregando = true;

  constructor(
    private catalogo: Catalogo,
    private carrinho: CarrinhoService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.carregarServicos());
  }

  private carregarServicos(): void {
    forkJoin({
      servicos: this.catalogo.listarServicos(),
      categorias: this.catalogo.listarCategorias()
    }).subscribe({
      next: ({ servicos, categorias }) => {
        this.categorias = categorias.map(categoria => categoria.categoria);
        this.servicos = servicos
          .filter(servico => servico.ativoProdutoServico === 'S')
          .map(servico => ({
            id: servico.iditem,
            nome: servico.item1,
            descricao: servico.descricaoItem,
            categoria: categorias.find(categoria =>
              categoria.idcategoria === servico.idcategoria)?.categoria ?? '',
            preco: Number(servico.preco)
          }));
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar os serviços.';
        this.carregando = false;
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
        servico.categoria === this.categoriaSelecionada;

      return correspondeNome && correspondeCategoria;
    });
  }

  adicionarAoCarrinho(servico: { id: number; nome: string; preco: number }): void {
    this.carrinho.adicionarItem({ id: servico.id, nome: servico.nome, preco: servico.preco });
    this.mensagem = servico.nome + ' adicionado ao carrinho!';
  }
}
