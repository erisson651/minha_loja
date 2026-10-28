
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  itens: ItemCarrinho[] = [];
  private navegador: boolean;

  constructor(@Inject(PLATFORM_ID) plataforma: object) {
    this.navegador = isPlatformBrowser(plataforma);

    if (this.navegador) {
      const dadosSalvos = localStorage.getItem('carrinho');

      if (dadosSalvos) {
        this.itens = JSON.parse(dadosSalvos);
      }
    }
  }

  private salvarCarrinho(): void {
    if (this.navegador) {
      localStorage.setItem('carrinho', JSON.stringify(this.itens));
    }
  }

  adicionarItem(produto: {
    id: number;
    nome: string;
    preco: number;
  }): void {
    const itemExistente = this.itens.find(
      item => item.id === produto.id
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.itens.push({
        ...produto,
        quantidade: 1
      });
    }

    this.salvarCarrinho();
  }

  aumentarQuantidade(id: number): void {
    const item = this.itens.find(item => item.id === id);

    if (item) {
      item.quantidade++;
      this.salvarCarrinho();
    }
  }

  diminuirQuantidade(id: number): void {
    const item = this.itens.find(item => item.id === id);

    if (item && item.quantidade > 1) {
      item.quantidade--;
      this.salvarCarrinho();
    }
  }

  removerItem(id: number): void {
    this.itens = this.itens.filter(item => item.id !== id);
    this.salvarCarrinho();
  }

  limparCarrinho(): void {
    this.itens = [];
    this.salvarCarrinho();
  }

  get total(): number {
    return this.itens.reduce(
      (soma, item) => soma + item.preco * item.quantidade,
      0
    );
  }
}
