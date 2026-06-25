import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecepcionistaService } from '../../core/services/recepcionista.service';
import { Recepcionista } from '../../core/models/recepcionista.model';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-recepcionistas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recepcionistas-list.html',
  styleUrl: './recepcionistas-list.scss'
})
export class RecepcionistasList implements OnInit {
  recepcionistas: Recepcionista[] = [];
  cargando = true;
  busqueda = '';

  constructor(
    private recepcionistaService: RecepcionistaService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRecepcionistas();
  }

  cargarRecepcionistas(): void {
    this.cargando = true;
    this.recepcionistaService.listarTodos().subscribe({
      next: (data) => {
        this.recepcionistas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar recepcionistas');
      }
    });
  }

  get recepcionistasFiltradas(): Recepcionista[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.recepcionistas;
    return this.recepcionistas.filter(r =>
      r.nombre.toLowerCase().includes(termino) ||
      r.apellido.toLowerCase().includes(termino) ||
      (r.dni || '').includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  async toggleActivo(recepcionista: Recepcionista): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: recepcionista.activo ? 'Deshabilitar recepcionista' : 'Habilitar recepcionista',
      message: recepcionista.activo
        ? `¿Deseas deshabilitar a ${recepcionista.nombre} ${recepcionista.apellido}? No podrá ser editada mientras esté deshabilitada.`
        : `¿Deseas habilitar a ${recepcionista.nombre} ${recepcionista.apellido} nuevamente?`,
      confirmText: recepcionista.activo ? 'Deshabilitar' : 'Habilitar',
      type: recepcionista.activo ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = recepcionista.activo
      ? this.recepcionistaService.deshabilitar(recepcionista.id!)
      : this.recepcionistaService.habilitar(recepcionista.id!);

    accion.subscribe({
      next: () => {
        recepcionista.activo = !recepcionista.activo;
        this.recepcionistas = [...this.recepcionistas];
        this.cdr.detectChanges();
        this.notification.success(
          `Recepcionista ${recepcionista.activo ? 'habilitada' : 'deshabilitada'} correctamente`
        );
      },
      error: () => this.notification.error('Error al cambiar el estado de la recepcionista')
    });
  }

  async eliminar(recepcionista: Recepcionista): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar recepcionista',
      message: `¿Eliminar a ${recepcionista.nombre} ${recepcionista.apellido}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.recepcionistaService.eliminar(recepcionista.id!).subscribe({
      next: () => {
        this.recepcionistas = this.recepcionistas.filter(r => r.id !== recepcionista.id);
        this.cdr.detectChanges();
        this.notification.success('Recepcionista eliminada correctamente');
      },
      error: (err) => {
        if (err.status === 400 && err.error?.mensaje?.toLowerCase().includes('constraint')) {
          this.notification.error('No se puede eliminar: la recepcionista tiene pacientes o pagos registrados.');
        } else {
          this.notification.error(err.error?.mensaje || 'Error al eliminar la recepcionista');
        }
      }
    });
  }
}
