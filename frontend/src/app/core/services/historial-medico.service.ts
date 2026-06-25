import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialMedico } from '../models/historial-medico.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialMedicoService {
  private apiUrl = `${environment.apiUrl}/historial`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(this.apiUrl);
  }

  listarPorPaciente(pacienteId: number): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  listarPorMedico(medicoId: number): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(`${this.apiUrl}/medico/${medicoId}`);
  }

  buscarPorId(id: number): Observable<HistorialMedico> {
    return this.http.get<HistorialMedico>(`${this.apiUrl}/${id}`);
  }

  crear(historial: HistorialMedico): Observable<HistorialMedico> {
    return this.http.post<HistorialMedico>(this.apiUrl, historial);
  }

  actualizar(id: number, historial: HistorialMedico): Observable<HistorialMedico> {
    return this.http.put<HistorialMedico>(`${this.apiUrl}/${id}`, historial);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
