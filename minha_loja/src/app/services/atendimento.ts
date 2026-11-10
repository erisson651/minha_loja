import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7258/api/Atendimento';

  finalizarCompra(compra: {
    idpessoas: number;
    idfuncionario: number;
    itens: { iditem: number; quantidadeItens: number }[];
  }) {
    return this.http.post<{ mensagem: string }>(this.apiUrl + '/finalizar-compra', compra);
  }
}
