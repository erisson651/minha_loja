
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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

  listarCategorias(): Observable<any[]> {
    return this.http.get<any[]>('https://localhost:7258/api/Categorium');
  }

  buscarItemPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.itemServiceUrl}/${id}`);
  }
}
