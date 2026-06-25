import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  @Output() toggleMobileMenu = new EventEmitter<void>();

  username: string | null = '';
  rol: string | null = '';
  menuAbierto = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRol();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getIniciales(): string {
    if (!this.username) return '?';
    return this.username.charAt(0).toUpperCase();
  }
}
