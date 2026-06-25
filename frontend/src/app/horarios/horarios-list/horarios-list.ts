import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HorarioMedicoService } from '../../core/services/horario-medico.service';
import { MedicoService } from '../../core/services/medico.service';
import { HorarioMedico } from '../../core/models/horario-medico.model';
import { Medico } from '../../core/models/medico.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

interface GrupoMedico {
  medicoId: number;
  medicoNombre: string;
  medicoEspecialidad: string;
  horarios: HorarioMedico[];
}

@Component({
  selector: 'app-horarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './horarios-list.html',
  styleUrl: './horarios-list.scss'
})
export class HorariosList implements OnInit {
  horarios: HorarioMedico[] = [];
  medicos: Medico[] = [];
  cargando = true;
  rol: string | null = '';
  miMedicoId: number | null = null;
  filtroMedicoId: string = 'todos';

  diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(
    private horarioService: HorarioMedicoService,
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
      this.cargarMiPerfilYHorarios();
    } else {
      this.cargarMedicos();
      this.cargarHorarios();
    }
  }

  cargarMiPerfilYHorarios(): void {
    this.cargando = true;
    this.medicoService.obtenerMiPerfil().subscribe({
      next: (medico) => {
        this.miMedicoId = medico.id!;
        this.horarioService.listarPorMedico(medico.id!).subscribe({
          next: (data) => {
            this.horarios = this.ordenarHorarios(data);
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
            this.notification.error('Error al cargar tus horarios');
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar tu perfil de médico');
      }
    });
  }

  cargarMedicos(): void {
    this.medicoService.listarActivos().subscribe({
      next: (data) => {
        this.medicos = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar médicos')
    });
  }

  cargarHorarios(): void {
    this.cargando = true;
    this.horarioService.listarTodos().subscribe({
      next: (data) => {
        this.horarios = this.ordenarHorarios(data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('Error al cargar horarios');
      }
    });
  }

  ordenarHorarios(data: HorarioMedico[]): HorarioMedico[] {
    return [...data].sort((a, b) => {
      const medA = (a.medicoNombre || '').localeCompare(b.medicoNombre || '');
      if (medA !== 0) return medA;
      return this.diasOrden.indexOf(a.diaSemana) - this.diasOrden.indexOf(b.diaSemana);
    });
  }

  get gruposFiltrados(): GrupoMedico[] {
    let lista = this.horarios;

    if (this.filtroMedicoId !== 'todos') {
      const idFiltro = Number(this.filtroMedicoId);
      lista = lista.filter(h => h.medicoId === idFiltro);
    }

    const mapa = new Map<number, GrupoMedico>();
    for (const h of lista) {
      if (!mapa.has(h.medicoId)) {
        mapa.set(h.medicoId, {
          medicoId: h.medicoId,
          medicoNombre: h.medicoNombre || '',
          medicoEspecialidad: h.medicoEspecialidad || '-',
          horarios: []
        });
      }
      mapa.get(h.medicoId)!.horarios.push(h);
    }

    return Array.from(mapa.values());
  }

  puedeCrear(): boolean {
    return this.rol === 'ADMIN';
  }

  puedeEditar(horario: HorarioMedico): boolean {
    if (this.rol === 'ADMIN') return true;
    if (this.rol === 'MEDICO') return horario.medicoId === this.miMedicoId;
    return false;
  }

  formatearHora(hora: string): string {
    return hora?.substring(0, 5) || '';
  }

  async toggleDisponible(horario: HorarioMedico): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: horario.disponible ? 'Deshabilitar horario' : 'Habilitar horario',
      message: horario.disponible
        ? `¿Deseas deshabilitar el horario del ${horario.diaSemana.toLowerCase()}?`
        : `¿Deseas habilitar el horario del ${horario.diaSemana.toLowerCase()} nuevamente?`,
      confirmText: horario.disponible ? 'Deshabilitar' : 'Habilitar',
      type: horario.disponible ? 'warning' : 'info'
    });

    if (!resultado.confirmed) return;

    const accion = horario.disponible
      ? this.horarioService.deshabilitar(horario.id!)
      : this.horarioService.habilitar(horario.id!);

    accion.subscribe({
      next: () => {
        horario.disponible = !horario.disponible;
        this.horarios = [...this.horarios];
        this.cdr.detectChanges();
        this.notification.success(
          `Horario ${horario.disponible ? 'habilitado' : 'deshabilitado'} correctamente`
        );
      },
      error: () => this.notification.error('Error al cambiar el estado del horario')
    });
  }

  async eliminar(horario: HorarioMedico): Promise<void> {
    const resultado = await this.confirmDialog.confirm({
      title: 'Eliminar horario',
      message: `¿Eliminar el horario del ${horario.diaSemana.toLowerCase()} de ${horario.medicoNombre}?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (!resultado.confirmed) return;

    this.horarioService.eliminar(horario.id!).subscribe({
      next: () => {
        this.horarios = this.horarios.filter(h => h.id !== horario.id);
        this.cdr.detectChanges();
        this.notification.success('Horario eliminado correctamente');
      },
      error: (err) => this.notification.error(err.error?.mensaje || 'Error al eliminar el horario')
    });
  }
}
