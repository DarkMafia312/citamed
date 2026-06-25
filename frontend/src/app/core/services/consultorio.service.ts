import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultorio } from '../../core/models/consultorio.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConsultorioService {
  private apiUrl = `${environment.apiUrl}/consultorios`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Consultorio[]> {
    return this.http.get<Consultorio[]>(this.apiUrl);
  }

  listarDisponibles(): Observable<Consultorio[]> {
    return this.http.get<Consultorio[]>(`${this.apiUrl}/disponibles`);
  }

  buscarPorId(id: number): Observable<Consultorio> {
    return this.http.get<Consultorio>(`${this.apiUrl}/${id}`);
  }

  crear(consultorio: Consultorio): Observable<Consultorio> {
    return this.http.post<Consultorio>(this.apiUrl, consultorio);
  }

  actualizar(id: number, consultorio: Consultorio): Observable<Consultorio> {
    return this.http.put<Consultorio>(`${this.apiUrl}/${id}`, consultorio);
  }

  habilitar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/habilitar`, {});
  }

  deshabilitar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deshabilitar`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
