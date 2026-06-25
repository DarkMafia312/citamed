import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { Cita } from '../../core/models/cita.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './citas-list.html',
  styleUrl: './citas-list.scss'
})
export class CitasList implements OnInit {
  citas: Cita[] = [];
  cargando = true;
  busqueda = '';
  filtroEstado = 'TODOS';
  rol: string | null = '';
  miMedicoId: number | null = null;

  estados = ['PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];

  constructor(
    private citaService: CitaService,
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
          this.cargarCitas();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
          this.notification.error('No se pudo cargar tu perfil de médico');
        }
      });
    } else {
      this.cargarCitas();
    }
  }

  cargarCitas(): void {
    this.cargando = true;
    const peticion = this.rol === 'MEDICO' && this.miMedicoId
      ? this.citaService.listarPorMedico(this.miMedicoId)
      : this.citaService.listarTodos();

    peticion.subscribe({
      next: (data) => {
        this.citas = this.ordenarCitas(data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar las citas');
      }
    });
  }

  ordenarCitas(data: Cita[]): Cita[] {
    return [...data].sort((a, b) => {
      const fechaA = `${a.fecha} ${a.hora}`;
      const fechaB = `${b.fecha} ${b.hora}`;
      return fechaB.localeCompare(fechaA);
    });
  }

  get citasFiltradas(): Cita[] {
    let lista = this.citas;

    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(c => c.estado === this.filtroEstado);
    }

    const termino = this.busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter(c =>
        (c.pacienteNombre || '').toLowerCase().includes(termino) ||
        (c.medicoNombre || '').toLowerCase().includes(termino) ||
        (c.pacienteDni || '').includes(termino)
      );
    }

    return lista;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'TODOS';
  }

  contarPorEstado(estado: string): number {
    if (estado === 'TODOS') return this.citas.length;
    return this.citas.filter(c => c.estado === estado).length;
  }

  puedeCrear(): boolean {
    return this.rol === 'ADMIN' || this.rol === 'RECEPCIONISTA';
  }

  puedeEditar(cita: Cita): boolean {
    if (cita.estado === 'CANCELADA' || cita.estado === 'ATENDIDA') return false;
    return this.rol === 'ADMIN' || this.rol === 'RECEPCIONISTA';
  }

  puedeConfirmar(cita: Cita): boolean {
    return cita.estado === 'PROGRAMADA' && (this.rol === 'ADMIN' || this.rol === 'MEDICO');
  }

  puedeAtender(cita: Cita): boolean {
    return (cita.estado === 'PROGRAMADA' || cita.estado === 'CONFIRMADA') &&
      (this.rol === 'ADMIN' || this.rol === 'MEDICO');
  }

  puedeCancelar(cita: Cita): boolean {
    return cita.estado !== 'CANCELADA' && cita.estado !== 'ATENDIDA';
  }

  puedeEliminar(): boolean {
    return this.rol === 'ADMIN';
  }

  tieneAcciones(cita: Cita): boolean {
    return this.puedeEditar(cita) ||
           this.puedeConfirmar(cita) ||
           this.puedeAtender(cita) ||
           this.puedeCancelar(cita) ||
           this.puedeEliminar();
  }

  formatearHora(hora: string): string {
    return hora?.substring(0, 5) || '';
  }

  async confirmar(cita: Cita): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Confirmar cita',
      message: `¿Confirmar la cita de ${cita.pacienteNombre} con ${cita.medicoNombre}?`,
      confirmText: 'Confirmar',
      type: 'info'
    });

    if (!resultado.confirmed) return;

    this.citaService.confirmar(cita.id!).subscribe({
      next: (actualizada) => {
        cita.estado = actualizada.estado;
        this.citas = [...this.citas];
        this.cdr.detectChanges();
        this.notification.success('Cita confirmada correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al confirmar la cita')
    });
  }

  async atender(cita: Cita): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Marcar como atendida',
      message: `¿Marcar la cita de ${cita.pacienteNombre} como atendida?`,
      confirmText: 'Atender',
      type: 'info'
    });

    if (!resultado.confirmed) return;

    this.citaService.atender(cita.id!).subscribe({
      next: (actualizada) => {
        cita.estado = actualizada.estado;
        this.citas = [...this.citas];
        this.cdr.detectChanges();
        this.notification.success('Cita marcada como atendida');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al actualizar la cita')
    });
  }

  async cancelar(cita: Cita): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Cancelar cita',
      message: `¿Cancelar la cita de ${cita.pacienteNombre} con ${cita.medicoNombre}?`,
      confirmText: 'Cancelar cita',
      type: 'warning',
      requireInput: true,
      inputLabel: 'Motivo de la cancelación *',
      inputPlaceholder: 'Ej. El paciente solicitó reprogramar'
    });

    if (!resultado.confirmed) return;

    this.citaService.cancelar(cita.id!, resultado.inputValue!).subscribe({
      next: (actualizada) => {
        cita.estado = actualizada.estado;
        cita.motivoCancelacion = actualizada.motivoCancelacion;
        this.citas = [...this.citas];
        this.cdr.detectChanges();
        this.notification.success('Cita cancelada correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al cancelar la cita')
    });
  }

  async eliminar(cita: Cita): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar cita',
      message: `¿Eliminar la cita de ${cita.pacienteNombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.citaService.eliminar(cita.id!).subscribe({
      next: () => {
        this.citas = this.citas.filter(c => c.id !== cita.id);
        this.cdr.detectChanges();
        this.notification.success('Cita eliminada correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al eliminar la cita')
    });
  }
}
