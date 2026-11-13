
import { Component, ChangeDetectorRef, DestroyRef, ElementRef, afterNextRender, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../services/catalogo';
import { CarrinhoService } from '../../services/carrinho';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

  itens: any[] = [];
  itensFiltrados: any[] = [];

  categorias: { idcategoria: number; categoria: string }[] = [];
  carregando = true;
  carrosselPausado = false;
  private readonly carrossel = viewChild<ElementRef<HTMLDivElement>>('carrossel');

  mensagem = '';

  pesquisa = '';
  categoriaSelecionada = '';
  tipoSelecionado = '';

  idConsulta: number | null = null;

  constructor(
    private catalogo: Catalogo,
    private cdr: ChangeDetectorRef,
    private carrinho: CarrinhoService,
    destroyRef: DestroyRef
  ) {
    afterNextRender(() => {
      this.carregarCatalogo();
      const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.carrosselPausado = movimentoReduzido.matches;
      this.cdr.markForCheck();

      const intervalo = window.setInterval(() => {
        const faixa = this.carrossel()?.nativeElement;
        if (!this.carrosselPausado && faixa && !faixa.matches(':hover, :focus-within')) {
          this.moverCarrossel(1);
        }
      }, 4500);
      destroyRef.onDestroy(() => window.clearInterval(intervalo));
    });
  }

  moverCarrossel(direcao: 1 | -1): void {
    const faixa = this.carrossel()?.nativeElement;
    if (!faixa) return;

    const limite = faixa.scrollWidth - faixa.clientWidth;
    if (limite <= 1) return;

    const inicio = faixa.scrollLeft <= 1;
    const fim = faixa.scrollLeft >= limite - 1;
    if (direcao === 1 && fim) {
      faixa.scrollTo({ left: 0 });
    } else if (direcao === -1 && inicio) {
      faixa.scrollTo({ left: limite });
    } else {
      const [primeiro, segundo] = Array.from(faixa.children) as HTMLElement[];
      const passo = segundo ? segundo.offsetLeft - primeiro.offsetLeft : faixa.clientWidth;
      faixa.scrollBy({ left: passo * direcao });
    }
  }

  filtrarItens(): void {
    const pesquisa = this.pesquisa.toLowerCase().trim();

    this.itensFiltrados = this.itens.filter(item => {
      const nome = item.iditemNavigation?.item1?.toLowerCase() || '';

      const categoria =
        String(item.iditemNavigation?.idcategoria ?? '');

      const tipo = item.iditemNavigation?.tipoItem || '';

      const correspondeNome = nome.includes(pesquisa);

      const correspondeCategoria =
        !this.categoriaSelecionada ||
        categoria === this.categoriaSelecionada;

      const correspondeTipo =
        !this.tipoSelecionado ||
        tipo === this.tipoSelecionado;

      return correspondeNome && correspondeCategoria && correspondeTipo;
    });
  }

  buscarPorId(): void {
    if (!this.idConsulta || !Number.isInteger(this.idConsulta) || this.idConsulta < 1) {
      this.mensagem = 'Digite um ID válido.';
      return;
    }

    this.catalogo.buscarItemPorId(this.idConsulta).subscribe({
      next: (dados) => {
        if (dados.ativoProdutoServico !== 'S') {
          this.itensFiltrados = [];
          this.mensagem = 'Este item está indisponível.';
          this.cdr.markForCheck();
          return;
        }

        const produto = this.itens.find(item => item.iditem === dados.iditem);

        const itemEncontrado = {
          iditem: dados.iditem,
          precoVenda: produto?.precoVenda ?? dados.preco,
          iditemNavigation: dados
        };

        this.itensFiltrados = [itemEncontrado];

        this.mensagem = `Item encontrado: ${dados.item1}`;

        this.cdr.detectChanges();
      },

      error: (erro) => {
        console.error('Erro ao consultar item:', erro);

        this.itensFiltrados = [];
        this.mensagem = erro.status === 404 ? 'Item não encontrado.' : 'Não foi possível consultar o item.';

        this.cdr.detectChanges();
      }
    });
  }

  adicionarAoCarrinho(item: any): void {
    const produto = {
      id: item.iditem,
      nome: item.iditemNavigation?.item1,
      preco: Number(item.precoVenda)
    };

    this.carrinho.adicionarItem(produto);

    this.mensagem = `${produto.nome} adicionado ao carrinho!`;
  }

  private carregarCatalogo(): void {
    forkJoin({
      produtos: this.catalogo.listarItens(),
      servicos: this.catalogo.listarServicos(),
      categorias: this.catalogo.listarCategorias()
    }).subscribe({
      next: ({ produtos, servicos, categorias }) => {
        this.categorias = categorias;
        this.itens = [
          ...produtos,
          ...servicos.map(servico => ({
            iditem: servico.iditem,
            precoVenda: servico.preco,
            iditemNavigation: servico
          }))
        ].filter(item => item.iditemNavigation?.ativoProdutoServico === 'S');
        this.filtrarItens();
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Não foi possível carregar o catálogo.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
