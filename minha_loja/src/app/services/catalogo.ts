
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Categoria {
  idcategoria: number;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class Catalogo {
  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7258/api/ProdutoItem';
  private itemServiceUrl = 'https://localhost:7258/api/ItemService';

  listarItens(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarServicos(): Observable<any[]> {
    return this.http.get<any[]>(this.itemServiceUrl).pipe(
      map(itens => itens.filter(item => item.tipoItem === 'S'))
    );
  }

  private categoriasUrl = 'https://localhost:7258/api/Categorium';

  listarCategorias() {
    return this.http.get<Categoria[]>(this.categoriasUrl);
  }

  buscarCategoria(id: number) {
    return this.http.get<Categoria>(this.categoriasUrl + '/' + id);
  }

  salvarCategoria(categoria: Categoria) {
    return categoria.idcategoria
      ? this.http.put<Categoria | null>(this.categoriasUrl + '/' + categoria.idcategoria, categoria)
      : this.http.post<Categoria | null>(this.categoriasUrl, categoria);
  }

  excluirCategoria(id: number) {
    return this.http.delete<void>(this.categoriasUrl + '/' + id);
  }

  cadastrarServico(servico: {
    idcategoria: number;
    item1: string;
    descricaoItem: string;
    preco: number;
  }): Observable<{ iditem: number }> {
    return this.http.post<{ iditem: number }>(this.itemServiceUrl, {
      ...servico,
      tipoItem: 'S',
      ativoProdutoServico: 'S'
    });
  }

  buscarItemPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.itemServiceUrl}/${id}`);
  }
}
