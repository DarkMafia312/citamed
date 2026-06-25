import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HistorialMedicoService } from '../../core/services/historial-medico.service';
import { MedicoService } from '../../core/services/medico.service';
import { HistorialMedico } from '../../core/models/historial-medico.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-historial-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './historial-list.html',
  styleUrl: './historial-list.scss'
})
export class HistorialList implements OnInit {
  historiales: HistorialMedico[] = [];
  cargando = true;
  busqueda = '';
  rol: string | null = '';
  miMedicoId: number | null = null;

  constructor(
    private historialService: HistorialMedicoService,
    private medicoService: MedicoService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    if (this.rol === 'MEDICO') {
      this.medicoService.obtenerMiPerfil().subscribe({
        next: (medico) => {
          this.miMedicoId = medico.id!;
          this.cargarHistoriales();
        },
        error: () => this.notification.error('No se pudo cargar tu perfil de médico')
      });
    } else {
      this.cargarHistoriales();
    }
  }

  cargarHistoriales(): void {
    this.cargando = true;
    this.historialService.listarTodos().subscribe({
      next: (data) => {
        this.historiales = this.ordenarPorFecha(data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar el historial médico');
      }
    });
  }

  ordenarPorFecha(data: HistorialMedico[]): HistorialMedico[] {
    return [...data].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }

  get historialesFiltrados(): HistorialMedico[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.historiales;
    return this.historiales.filter(h =>
      (h.pacienteNombre || '').toLowerCase().includes(termino) ||
      (h.medicoNombre || '').toLowerCase().includes(termino) ||
      (h.diagnostico || '').toLowerCase().includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  puedeCrear(): boolean {
    return this.rol === 'ADMIN' || this.rol === 'MEDICO';
  }

  puedeEditar(historial: HistorialMedico): boolean {
    if (this.rol === 'ADMIN') return true;
    if (this.rol === 'MEDICO') return historial.medicoId === this.miMedicoId;
    return false;
  }

  puedeEliminar(): boolean {
    return this.rol === 'ADMIN';
  }

  async eliminar(historial: HistorialMedico): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar registro de historial',
      message: `¿Eliminar el registro médico de ${historial.pacienteNombre} del ${historial.fecha}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.historialService.eliminar(historial.id!).subscribe({
      next: () => {
        this.historiales = this.historiales.filter(h => h.id !== historial.id);
        this.cdr.detectChanges();
        this.notification.success('Registro eliminado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al eliminar el registro')
    });
  }
}
