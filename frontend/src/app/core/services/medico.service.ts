import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medico } from '../models/medico.model';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  listarActivos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/activos`);
  }

  buscarPorId(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  buscar(busqueda: string): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/buscar`, {
      params: { busqueda }
    });
  }

  listarPorEspecialidad(nombre: string): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/especialidad`, {
      params: { nombre }
    });
  }

  obtenerMiPerfil(): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/me`);
  }

  actualizarMiPerfil(id: number, medico: Partial<Medico>): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/me`, medico);
  }

  crear(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico);
  }

  actualizar(id: number, medico: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, medico);
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
