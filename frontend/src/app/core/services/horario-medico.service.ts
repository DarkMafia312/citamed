import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HorarioMedico } from '../models/horario-medico.model';

@Injectable({
  providedIn: 'root'
})
export class HorarioMedicoService {
  private apiUrl = `${environment.apiUrl}/horarios`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(this.apiUrl);
  }

  listarPorMedico(medicoId: number): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(`${this.apiUrl}/medico/${medicoId}`);
  }

  listarDisponiblesPorMedico(medicoId: number): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(`${this.apiUrl}/medico/${medicoId}/disponibles`);
  }

  buscarPorId(id: number): Observable<HorarioMedico> {
    return this.http.get<HorarioMedico>(`${this.apiUrl}/${id}`);
  }

  crear(horario: HorarioMedico): Observable<HorarioMedico> {
    return this.http.post<HorarioMedico>(this.apiUrl, horario);
  }

  actualizar(id: number, horario: HorarioMedico): Observable<HorarioMedico> {
    return this.http.put<HorarioMedico>(`${this.apiUrl}/${id}`, horario);
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
