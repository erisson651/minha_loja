
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {

  itens: any[] = [];
  itensFiltrados: any[] = [];

  mensagem = '';

  pesquisa = '';
  categoriaSelecionada = '';
  tipoSelecionado = '';

  idConsulta: number | null = null;

  constructor(
    private catalogo: Catalogo,
    private cdr: ChangeDetectorRef
  ) {}

  filtrarItens(): void {
    const pesquisa = this.pesquisa.toLowerCase().trim();

    this.itensFiltrados = this.itens.filter(item => {
      const nome = item.iditemNavigation?.item1?.toLowerCase() || '';

      return nome.includes(pesquisa);
    });
  }

  buscarPorId(): void {
    if (!this.idConsulta) {
      this.mensagem = 'Digite um ID válido.';
      return;
    }
  
    this.catalogo.buscarItemPorId(this.idConsulta).subscribe({
      next: (dados) => {
        console.log('Item encontrado:', dados);
  
        const itemEncontrado = {
          precoVenda: dados.preco,
          iditemNavigation: dados
        };
  
        this.itensFiltrados = [itemEncontrado];
  
        this.mensagem = `Item encontrado: ${dados.item1}`;
  
        this.cdr.detectChanges();
      },
  
      error: (erro) => {
        console.error('Erro ao consultar item:', erro);
  
        this.itensFiltrados = [];
        this.mensagem = 'Item não encontrado.';
  
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    this.catalogo.listarItens().subscribe({
      next: (dados) => {

        console.log('Dados recebidos da API:', dados);

        this.itens = dados.filter(
          item => item.iditemNavigation?.ativoProdutoServico === 'S'
        );

        this.itensFiltrados = [...this.itens];

        this.cdr.detectChanges();

        console.log('Quantidade dentro do componente:', this.itens.length);
      },

      error: (erro) => {
        console.error('Erro ao carregar catálogo:', erro);
        this.mensagem = 'Não foi possível carregar os itens da loja.';
        this.cdr.detectChanges();
      }
    });
  }
}
