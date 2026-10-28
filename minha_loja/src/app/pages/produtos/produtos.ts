
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
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

  constructor(private carrinhoService: CarrinhoService) {}

  produtos = [
    {
      id: 1,
      nome: 'Hidratante Facial',
      descricao: 'Hidratação diária para a pele.',
      categoria: 'Cuidados com a pele',
      preco: 49.90,
      estoque: 15
    },
    {
      id: 2,
      nome: 'Protetor Solar',
      descricao: 'Proteção para o cuidado diário da pele.',
      categoria: 'Cuidados com a pele',
      preco: 59.90,
      estoque: 20
    },
    {
      id: 3,
      nome: 'Shampoo Nutritivo',
      descricao: 'Limpeza e nutrição para os cabelos.',
      categoria: 'Cuidados com os cabelos',
      preco: 34.90,
      estoque: 10
    }
  ];

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

    if (!produto) {
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
