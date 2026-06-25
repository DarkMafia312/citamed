import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('rol', response.rol);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getRol() === role;
  }
}
