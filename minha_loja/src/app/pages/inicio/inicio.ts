
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Catalogo } from '../../services/catalogo';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  itens: any[] = [];
  mensagem = '';

  constructor(private catalogo: Catalogo) {}

  ngOnInit(): void {
    this.catalogo.listarItens().subscribe({
      next: (dados) => {
        console.log('Dados recebidos da API:', dados);
        this.itens = dados;
        console.log('Quantidade dentro do componente:', this.itens.length);
      },
      error: (erro) => {
        console.error('Erro ao carregar catálogo:', erro);
        this.mensagem = 'Não foi possível carregar os itens da loja.';
      }
    });
  }
}
