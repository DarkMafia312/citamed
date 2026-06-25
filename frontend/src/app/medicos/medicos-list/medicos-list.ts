import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MedicoService } from '../../core/services/medico.service';
import { Medico } from '../../core/models/medico.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-medicos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './medicos-list.html',
  styleUrl: './medicos-list.scss'
})
export class MedicosList implements OnInit {
  medicos: Medico[] = [];
  cargando = true;
  busqueda = '';
  rol: string | null = '';
  private busquedaSubject = new Subject<string>();

  constructor(
    private medicoService: MedicoService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    this.cargarMedicos();

    this.busquedaSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.ejecutarBusqueda(termino);
    });
  }

  onBusquedaChange(): void {
    this.busquedaSubject.next(this.busqueda.trim());
  }

  ejecutarBusqueda(termino: string): void {
    if (!termino) {
      this.cargarMedicos();
      return;
    }
    this.medicoService.buscar(termino).subscribe({
      next: (data) => {
        this.medicos = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error en la búsqueda')
    });
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.medicoService.listarTodos().subscribe({
      next: (data) => {
        this.medicos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar médicos');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.cargarMedicos();
  }

  async toggleActivo(medico: Medico): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: medico.activo ? 'Deshabilitar médico' : 'Habilitar médico',
      message: medico.activo
        ? `¿Deseas deshabilitar a ${medico.nombre} ${medico.apellido}? No podrá ser editado mientras esté deshabilitado.`
        : `¿Deseas habilitar a ${medico.nombre} ${medico.apellido} nuevamente?`,
      confirmText: medico.activo ? 'Deshabilitar' : 'Habilitar',
      type: medico.activo ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = medico.activo
      ? this.medicoService.deshabilitar(medico.id!)
      : this.medicoService.habilitar(medico.id!);

    accion.subscribe({
      next: () => {
        medico.activo = !medico.activo;
        this.medicos = [...this.medicos];
        this.cdr.detectChanges();
        this.notification.success(
          `Médico ${medico.activo ? 'habilitado' : 'deshabilitado'} correctamente`
        );
      },
      error: () => this.notification.error('Error al cambiar el estado del médico')
    });
  }

  async eliminar(medico: Medico): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar médico',
      message: `¿Eliminar a ${medico.nombre} ${medico.apellido}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.medicoService.eliminar(medico.id!).subscribe({
      next: () => {
        this.medicos = this.medicos.filter(m => m.id !== medico.id);
        this.cdr.detectChanges();
        this.notification.success('Médico eliminado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al eliminar el médico')
    });
  }

  puedeGestionar(): boolean {
    return this.rol === 'ADMIN';
  }
}
