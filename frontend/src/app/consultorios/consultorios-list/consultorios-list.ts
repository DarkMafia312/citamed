import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsultorioService } from '../../core/services/consultorio.service';
import { Consultorio } from '../../core/models/consultorio.model';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-consultorios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './consultorios-list.html',
  styleUrl: './consultorios-list.scss'
})
export class ConsultoriosList implements OnInit {
  consultorios: Consultorio[] = [];
  cargando = true;
  busqueda = '';

  constructor(
    private consultorioService: ConsultorioService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConsultorios();
  }

  cargarConsultorios(): void {
    this.cargando = true;
    this.consultorioService.listarTodos().subscribe({
      next: (data) => {
        this.consultorios = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar consultorios');
      }
    });
  }

  get consultoriosFiltrados(): Consultorio[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.consultorios;
    return this.consultorios.filter(c =>
      c.codigo.toLowerCase().includes(termino) ||
      c.nombre.toLowerCase().includes(termino) ||
      (c.tipo || '').toLowerCase().includes(termino)
    );
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  async toggleDisponible(consultorio: Consultorio): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: consultorio.disponible ? 'Deshabilitar consultorio' : 'Habilitar consultorio',
      message: consultorio.disponible
        ? `¿Deseas deshabilitar el consultorio "${consultorio.nombre}"? No podrá ser editado ni usado en nuevas citas mientras esté deshabilitado.`
        : `¿Deseas habilitar el consultorio "${consultorio.nombre}" nuevamente?`,
      confirmText: consultorio.disponible ? 'Deshabilitar' : 'Habilitar',
      type: consultorio.disponible ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = consultorio.disponible
      ? this.consultorioService.deshabilitar(consultorio.id!)
      : this.consultorioService.habilitar(consultorio.id!);

    accion.subscribe({
      next: () => {
        consultorio.disponible = !consultorio.disponible;
        this.consultorios = [...this.consultorios];
        this.cdr.detectChanges();
        this.notification.success(
          `Consultorio ${consultorio.disponible ? 'habilitado' : 'deshabilitado'} correctamente`
        );
      },
      error: () => this.notification.error('Error al cambiar el estado del consultorio')
    });
  }

  async eliminar(consultorio: Consultorio): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar consultorio',
      message: `¿Eliminar el consultorio "${consultorio.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.consultorioService.eliminar(consultorio.id!).subscribe({
      next: () => {
        this.consultorios = this.consultorios.filter(c => c.id !== consultorio.id);
        this.cdr.detectChanges();
        this.notification.success('Consultorio eliminado correctamente');
      },
      error: (err) => {
        if (err.status === 400 && err.error?.mensaje?.toLowerCase().includes('constraint')) {
          this.notification.error('No se puede eliminar: el consultorio tiene citas registradas.');
        } else {
          this.notification.error(err.error?.mensaje || 'Error al eliminar el consultorio');
        }
      }
    });
  }
}
