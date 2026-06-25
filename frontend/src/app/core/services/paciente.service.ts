import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  listarActivos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/activos`);
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  buscar(busqueda: string): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/buscar`, {
      params: { busqueda }
    });
  }

  crear(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  actualizar(id: number, paciente: Paciente): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
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
