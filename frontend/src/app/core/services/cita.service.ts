import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../models/cita.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  listarPorMedico(medicoId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/medico/${medicoId}`);
  }

  listarPorPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  buscarPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  crear(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  actualizar(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita);
  }

  confirmar(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/confirmar`, {});
  }

  atender(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/atender`, {});
  }

  cancelar(id: number, motivo: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.apiUrl}/${id}/cancelar?motivo=${encodeURIComponent(motivo)}`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
