import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PacienteService } from '../../core/services/paciente.service';
import { Paciente } from '../../core/models/paciente.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pacientes-list.html',
  styleUrl: './pacientes-list.scss'
})
export class PacientesList implements OnInit {
  pacientes: Paciente[] = [];
  cargando = true;
  busqueda = '';
  rol: string | null = '';
  private busquedaSubject = new Subject<string>();

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    this.cargarPacientes();

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
      this.cargarPacientes();
      return;
    }
    this.pacienteService.buscar(termino).subscribe({
      next: (data) => {
        this.pacientes = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error en la búsqueda')
    });
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.pacienteService.listarTodos().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar pacientes');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.cargarPacientes();
  }

  async toggleActivo(paciente: Paciente): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: paciente.activo ? 'Deshabilitar paciente' : 'Habilitar paciente',
      message: paciente.activo
        ? `¿Deseas deshabilitar a ${paciente.nombre} ${paciente.apellido}? No podrá ser editado mientras esté deshabilitado.`
        : `¿Deseas habilitar a ${paciente.nombre} ${paciente.apellido} nuevamente?`,
      confirmText: paciente.activo ? 'Deshabilitar' : 'Habilitar',
      type: paciente.activo ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = paciente.activo
      ? this.pacienteService.deshabilitar(paciente.id!)
      : this.pacienteService.habilitar(paciente.id!);

    accion.subscribe({
      next: () => {
        paciente.activo = !paciente.activo;
        this.pacientes = [...this.pacientes];
        this.cdr.detectChanges();
        this.notification.success(
          `Paciente ${paciente.activo ? 'habilitado' : 'deshabilitado'} correctamente`
        );
      },
      error: () => this.notification.error('Error al cambiar el estado del paciente')
    });
  }

  async eliminar(paciente: Paciente): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar paciente',
      message: `¿Eliminar a ${paciente.nombre} ${paciente.apellido}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.pacienteService.eliminar(paciente.id!).subscribe({
      next: () => {
        this.pacientes = this.pacientes.filter(p => p.id !== paciente.id);
        this.cdr.detectChanges();
        this.notification.success('Paciente eliminado correctamente');
      },
      error: (err) => {
        if (err.status === 400 && err.error?.mensaje?.toLowerCase().includes('constraint')) {
          this.notification.error('No se puede eliminar: el paciente tiene citas, pagos o historial registrado. Deshabilítalo en su lugar.');
        } else {
          this.notification.error(err.error?.mensaje || 'Error al eliminar el paciente');
        }
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  puedeGestionar(): boolean {
    return this.rol === 'ADMIN' || this.rol === 'RECEPCIONISTA';
  }
}
