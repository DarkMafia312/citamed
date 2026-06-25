import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidad } from '../models/especialidad.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private apiUrl = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.apiUrl}/${id}`);
  }

  crear(especialidad: Especialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, especialidad);
  }

  actualizar(id: number, especialidad: Especialidad): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.apiUrl}/${id}`, especialidad);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
