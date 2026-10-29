
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Catalogo {
  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7258/api/ProdutoItem';

  listarItens(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
