import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss'
})
export class UsuariosList implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  busqueda = '';
  filtroRol = 'TODOS';
  miUsername: string | null = '';

  roles = ['ADMIN', 'MEDICO', 'RECEPCIONISTA'];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.miUsername = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar usuarios');
      }
    });
  }

  seleccionarRol(rol: string): void {
    this.filtroRol = rol;
  }

  get usuariosFiltrados(): Usuario[] {
    let lista = this.usuarios;

    if (this.filtroRol !== 'TODOS') {
      lista = lista.filter(u => u.rol === this.filtroRol);
    }

    const termino = this.busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter(u => u.username.toLowerCase().includes(termino));
    }

    return lista;
  }

  contarPorRol(rol: string): number {
    if (rol === 'TODOS') return this.usuarios.length;
    return this.usuarios.filter(u => u.rol === rol).length;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroRol = 'TODOS';
  }

  esMiCuenta(usuario: Usuario): boolean {
    return usuario.username === this.miUsername;
  }

  async toggleActivo(usuario: Usuario): Promise<void> {
    if (this.esMiCuenta(usuario)) {
      this.notification.warning('No puedes deshabilitar tu propia cuenta');
      return;
    }

    const resultado = await this.confirmDialog.confirm({
      title: usuario.activo ? 'Deshabilitar usuario' : 'Habilitar usuario',
      message: usuario.activo
        ? `¿Deseas deshabilitar el acceso de "${usuario.username}"? No podrá iniciar sesión mientras esté deshabilitado.`
        : `¿Deseas habilitar el acceso de "${usuario.username}" nuevamente?`,
      confirmText: usuario.activo ? 'Deshabilitar' : 'Habilitar',
      type: usuario.activo ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = usuario.activo
      ? this.usuarioService.deshabilitar(usuario.id!)
      : this.usuarioService.habilitar(usuario.id!);

    accion.subscribe({
      next: () => {
        usuario.activo = !usuario.activo;
        this.usuarios = [...this.usuarios];
        this.cdr.detectChanges();
        this.notification.success(
          `Usuario ${usuario.activo ? 'habilitado' : 'deshabilitado'} correctamente`
        );
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al cambiar el estado del usuario')
    });
  }
}
