import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Estoque {
  iditem: number;
  nome: string;
  descricao: string;
  quantidadeEstoque: number;
  precoVenda: number;
  unidade: string;
}

export interface Entrada {
  iditem: number;
  dataEntradaProduto: string;
  quantidadeEntrada: number;
  unidade: string;
  valorUnitarioEntrada: number;
}

export interface Cliente {
  idPessoa: number;
  nome: string;
}

export interface PedidoApi {
  idatendimento: number;
  idpessoas: number;
  dataAtendimento: string;
  statusAtendimento: string;
  idpessoasNavigation?: { nome: string };
  atendimentoitems?: {
    iditem: number;
    quantidadeItens: number;
    valorunitarioEntrada: number;
    iditemNavigation?: { item1: string };
    idfuncionarioNavigation?: { cargo: string };
  }[];
}

@Injectable({ providedIn: 'root' })
export class AdministracaoService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7258/api';

  listarClientes() {
    return this.http.get<Cliente[]>(this.api + '/PessoaEndereco');
  }

  buscarCliente(id: number) {
    return this.http.get<Cliente>(this.api + '/PessoaEndereco/' + id);
  }

  listarPedidos() {
    return this.http.get<PedidoApi[]>(this.api + '/Atendimento');
  }

  buscarPedido(id: number) {
    return this.http.get<PedidoApi>(this.api + '/Atendimento/' + id);
  }

  listarEstoque() {
    return this.http.get<Estoque[]>(this.api + '/Estoque');
  }

  registrarEntrada(entrada: Entrada) {
    return this.http.post(this.api + '/EntradaProduto', entrada);
  }
}
