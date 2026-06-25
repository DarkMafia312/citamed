import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { Especialidad } from '../../core/models/especialidad.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-especialidades-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './especialidades-list.html',
  styleUrl: './especialidades-list.scss'
})
export class EspecialidadesList implements OnInit {
  especialidades: Especialidad[] = [];
  cargando = true;
  busqueda = '';
  rol: string | null = '';

  constructor(
    private especialidadService: EspecialidadService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.cargando = true;
    this.especialidadService.listarTodos().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar especialidades');
      }
    });
  }

  get especialidadesFiltradas(): Especialidad[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.especialidades;
    return this.especialidades.filter(e =>
      e.nombre.toLowerCase().includes(termino) ||
      (e.descripcion || '').toLowerCase().includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  async eliminar(especialidad: Especialidad): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar especialidad',
      message: `¿Eliminar la especialidad "${especialidad.nombre}"? Esta acción no se puede deshacer. Si existen médicos asociados, no podrá eliminarse.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.especialidadService.eliminar(especialidad.id!).subscribe({
      next: () => {
        this.especialidades = this.especialidades.filter(e => e.id !== especialidad.id);
        this.cdr.detectChanges();
        this.notification.success('Especialidad eliminada correctamente');
      },
      error: (err) => {
        if (err.status === 400 && err.error?.mensaje?.toLowerCase().includes('constraint')) {
          this.notification.error('No se puede eliminar: existen médicos asociados a esta especialidad.');
        } else {
          this.notification.error(err.error?.mensaje || 'Error al eliminar la especialidad');
        }
      }
    });
  }

  puedeGestionar(): boolean {
    return this.rol === 'ADMIN';
  }
}
