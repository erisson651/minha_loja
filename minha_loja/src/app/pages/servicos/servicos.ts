
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

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

  servicos = [
    {
      id: 1,
      nome: 'Limpeza de Pele',
      descricao: 'Limpeza e cuidado para manter a pele saudável.',
      categoria: 'Cuidados com a pele',
      preco: 89.90
    },
    {
      id: 2,
      nome: 'Massagem Relaxante',
      descricao: 'Uma sessão voltada ao relaxamento e bem-estar.',
      categoria: 'Bem-estar',
      preco: 120.00
    },
    {
      id: 3,
      nome: 'Hidratação Capilar',
      descricao: 'Tratamento para hidratar e cuidar dos cabelos.',
      categoria: 'Cuidados com os cabelos',
      preco: 65.00
    }
  ];

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

  selecionarServico(nome: string) {
    alert(`${nome} selecionado. A integração com os agendamentos será feita depois.`);
  }
}
