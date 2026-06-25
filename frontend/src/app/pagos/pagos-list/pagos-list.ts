import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../../core/services/pago.service';
import { Pago } from '../../core/models/pago.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pagos-list.html',
  styleUrl: './pagos-list.scss'
})
export class PagosList implements OnInit {
  pagos: Pago[] = [];
  cargando = true;
  busqueda = '';
  filtroEstado = 'TODOS';
  rol: string | null = '';

  estados = ['PENDIENTE', 'PAGADO', 'ANULADO'];

  constructor(
    private pagoService: PagoService,
    private authService: AuthService,
    private notification: NotificationService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.pagoService.listarTodos().subscribe({
      next: (data) => {
        this.pagos = this.ordenarPagos(data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar los pagos');
      }
    });
  }

  ordenarPagos(data: Pago[]): Pago[] {
    return [...data].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }

  get pagosFiltrados(): Pago[] {
    let lista = this.pagos;

    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(p => p.estado === this.filtroEstado);
    }

    const termino = this.busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter(p =>
        (p.pacienteNombre || '').toLowerCase().includes(termino) ||
        (p.concepto || '').toLowerCase().includes(termino) ||
        (p.numeroBoleta || '').toLowerCase().includes(termino)
      );
    }

    return lista;
  }

  contarPorEstado(estado: string): number {
    if (estado === 'TODOS') return this.pagos.length;
    return this.pagos.filter(p => p.estado === estado).length;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'TODOS';
  }

  get totalPagado(): number {
    return this.pagos
      .filter(p => p.estado === 'PAGADO')
      .reduce((sum, p) => sum + Number(p.monto), 0);
  }

  puedeEditar(pago: Pago): boolean {
    return pago.estado === 'PENDIENTE';
  }

  puedeConfirmar(pago: Pago): boolean {
    return pago.estado === 'PENDIENTE';
  }

  puedeAnular(): boolean {
    return this.rol === 'ADMIN';
  }

  puedeEliminar(): boolean {
    return this.rol === 'ADMIN';
  }

  tieneAcciones(pago: Pago): boolean {
    return this.puedeEditar(pago) || this.puedeConfirmar(pago) ||
           (this.puedeAnular() && pago.estado !== 'ANULADO') || this.puedeEliminar();
  }

  async confirmarPago(pago: Pago): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Confirmar pago',
      message: `¿Confirmar el pago de S/ ${pago.monto} de ${pago.pacienteNombre}?`,
      confirmText: 'Confirmar',
      type: 'info'
    });

    if (!resultado.confirmed) return;

    this.pagoService.confirmarPago(pago.id!).subscribe({
      next: (actualizado) => {
        pago.estado = actualizado.estado;
        this.pagos = [...this.pagos];
        this.cdr.detectChanges();
        this.notification.success('Pago confirmado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al confirmar el pago')
    });
  }

  async anularPago(pago: Pago): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Anular pago',
      message: `¿Anular el pago de S/ ${pago.monto} de ${pago.pacienteNombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Anular',
      type: 'warning'
    });

    if (!resultado.confirmed) return;

    this.pagoService.anularPago(pago.id!).subscribe({
      next: (actualizado) => {
        pago.estado = actualizado.estado;
        this.pagos = [...this.pagos];
        this.cdr.detectChanges();
        this.notification.success('Pago anulado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al anular el pago')
    });
  }

  async eliminar(pago: Pago): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar pago',
      message: `¿Eliminar el pago de S/ ${pago.monto} de ${pago.pacienteNombre}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.pagoService.eliminar(pago.id!).subscribe({
      next: () => {
        this.pagos = this.pagos.filter(p => p.id !== pago.id);
        this.cdr.detectChanges();
        this.notification.success('Pago eliminado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al eliminar el pago')
    });
  }
}
