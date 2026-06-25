import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  listarPorPaciente(pacienteId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  listarPorRecepcionista(recepcionistaId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/recepcionista/${recepcionistaId}`);
  }

  crear(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  actualizar(id: number, pago: Pago): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  confirmarPago(id: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${id}/confirmar`, {});
  }

  anularPago(id: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${id}/anular`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
