import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  collapsed = false;
  rol: string | null = '';

  menuPrincipal: MenuItem[] = [
    { label: 'Dashboard', icon: 'grid', route: '/dashboard', roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA'] }
  ];

  menuClinica: MenuItem[] = [
    { label: 'Citas', icon: 'calendar', route: '/dashboard/citas', roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA'] },
    { label: 'Pacientes', icon: 'users', route: '/dashboard/pacientes', roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA'] },
    { label: 'Médicos', icon: 'stethoscope', route: '/dashboard/medicos', roles: ['ADMIN'] },
    { label: 'Especialidades', icon: 'tag', route: '/dashboard/especialidades', roles: ['ADMIN'] },
    { label: 'Consultorios', icon: 'door', route: '/dashboard/consultorios', roles: ['ADMIN'] },
    { label: 'Horarios médicos', icon: 'clock', route: '/dashboard/horarios', roles: ['ADMIN', 'MEDICO'] },
    { label: 'Historial médico', icon: 'file', route: '/dashboard/historial', roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA'] },
    { label: 'Pagos realizados', icon: 'cash', route: '/dashboard/pagos', roles: ['ADMIN', 'RECEPCIONISTA'] }
  ];

  menuAdmin: MenuItem[] = [
    { label: 'Mi Perfil', icon: 'profile', route: '/dashboard/mi-perfil', roles: ['MEDICO'] },
    { label: 'Mi Perfil', icon: 'profileRecep', route: '/dashboard/mi-perfil-recepcionista', roles: ['RECEPCIONISTA'] },
    { label: 'Recepcionistas', icon: 'badge', route: '/dashboard/recepcionistas', roles: ['ADMIN'] },
    { label: 'Usuarios', icon: 'lock', route: '/dashboard/usuarios', roles: ['ADMIN'] }
  ];

  constructor(private authService: AuthService) {
    this.rol = this.authService.getRol();
  }

  visible(item: MenuItem): boolean {
    return !!this.rol && item.roles.includes(this.rol);
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  onLinkClick(): void {
    this.closeMobile.emit();
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      grid: '▦',
      calendar: '📅',
      users: '👥',
      stethoscope: '🩺',
      tag: '🏷️',
      door: '🚪',
      clock: '🕐',
      file: '📋',
      cash: '💵',
      badge: '🪪',
      lock: '🔒',
      profile: '👨‍⚕️',
      profileRecep: '👩‍💼'
    };
    return icons[name] || '•';
  }
}
