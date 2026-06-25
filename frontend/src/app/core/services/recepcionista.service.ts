import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recepcionista } from '../models/recepcionista.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecepcionistaService {
  private apiUrl = `${environment.apiUrl}/recepcionistas`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Recepcionista[]> {
    return this.http.get<Recepcionista[]>(this.apiUrl);
  }

  listarActivos(): Observable<Recepcionista[]> {
    return this.http.get<Recepcionista[]>(`${this.apiUrl}/activos`);
  }

  obtenerMiPerfil(): Observable<Recepcionista> {
    return this.http.get<Recepcionista>(`${this.apiUrl}/me`);
  }

  actualizarMiPerfil(data: Partial<Recepcionista>): Observable<Recepcionista> {
    return this.http.put<Recepcionista>(`${this.apiUrl}/me`, data);
  }

  buscarPorId(id: number): Observable<Recepcionista> {
    return this.http.get<Recepcionista>(`${this.apiUrl}/${id}`);
  }

  crear(recepcionista: Recepcionista): Observable<Recepcionista> {
    return this.http.post<Recepcionista>(this.apiUrl, recepcionista);
  }

  actualizar(id: number, recepcionista: Recepcionista): Observable<Recepcionista> {
    return this.http.put<Recepcionista>(`${this.apiUrl}/${id}`, recepcionista);
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
