import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { PacienteService } from '../../core/services/paciente.service';
import { CitaService } from '../../core/services/cita.service';
import { MedicoService } from '../../core/services/medico.service';
import { PagoService } from '../../core/services/pago.service';
import { Cita } from '../../core/models/cita.model';
import { Pago } from '../../core/models/pago.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome implements OnInit {
  username: string | null = '';
  rol: string | null = '';
  cargando = true;
  horaActual = new Date();

  statCards = [
    {
      icon: '👥',
      label: 'Total Pacientes',
      desc: 'Pacientes registrados activos',
      value: 0,
      color: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      route: '/dashboard/pacientes'
    },
    {
      icon: '🩺',
      label: 'Total Médicos',
      desc: 'Médicos activos en el sistema',
      value: 0,
      color: 'linear-gradient(135deg, #34d399, #10b981)',
      route: '/dashboard/medicos'
    },
    {
      icon: '📅',
      label: 'Citas Programadas',
      desc: 'Citas pendientes por atender',
      value: 0,
      color: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      route: '/dashboard/citas'
    },
    {
      icon: '🕐',
      label: 'Citas de Hoy',
      desc: 'Citas programadas para el día actual',
      value: 0,
      color: 'linear-gradient(135deg, #f472b6, #ec4899)',
      route: '/dashboard/citas'
    }
  ];

  accesosRapidos = [
    { icon: '➕', label: 'Nueva Cita', desc: 'Registrar una nueva cita médica', route: '/dashboard/citas/nuevo' },
    { icon: '🧑‍⚕️', label: 'Pacientes', desc: 'Gestionar pacientes registrados', route: '/dashboard/pacientes' },
    { icon: '🩺', label: 'Médicos', desc: 'Gestionar médicos y especialidades', route: '/dashboard/medicos' },
    { icon: '📋', label: 'Historial', desc: 'Ver historial médico de pacientes', route: '/dashboard/historial' }
  ];

  miMedicoId: number | null = null;
  miEspecialidad = '';
  citasHoy: Cita[] = [];
  citasPendientes: Cita[] = [];
  totalPacientes = 0;
  cargandoMedico = true;

  accesosRapidosMedico = [
    { icon: '📅', label: 'Mis Citas', desc: 'Ver citas asignadas a mí', route: '/dashboard/citas' },
    { icon: '👥', label: 'Mis Pacientes', desc: 'Ver mis pacientes', route: '/dashboard/pacientes' },
    { icon: '📋', label: 'Historial', desc: 'Registrar y ver historiales', route: '/dashboard/historial' },
    { icon: '🕐', label: 'Mi Horario', desc: 'Ver mi horario semanal', route: '/dashboard/horarios' }
  ];

  citasHoyTotal: Cita[] = [];
  pagosPendientes: Pago[] = [];
  totalRecaudadoHoy = 0;
  totalPacientesActivos = 0;
  cargandoRecepcionista = true;

  accesosRapidosRecepcionista = [
    { icon: '➕', label: 'Nueva Cita', desc: 'Registrar una nueva cita médica', route: '/dashboard/citas/nuevo' },
    { icon: '👥', label: 'Pacientes', desc: 'Gestionar pacientes registrados', route: '/dashboard/pacientes' },
    { icon: '💵', label: 'Pagos', desc: 'Registrar y gestionar pagos', route: '/dashboard/pagos' },
    { icon: '📋', label: 'Historial', desc: 'Consultar historial médico', route: '/dashboard/historial' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private pacienteService: PacienteService,
    private dashboardService: DashboardService,
    private citaService: CitaService,
    private medicoService: MedicoService,
    private pagoService: PagoService,
    private cdr: ChangeDetectorRef
  ) {
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRol();
  }

  ngOnInit(): void {
    if (this.rol === 'MEDICO') {
      this.cargarDashboardMedico();
    } else if (this.rol === 'RECEPCIONISTA') {
      this.cargarDashboardRecepcionista();
    } else {
      this.cargarEstadisticas();
    }
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.dashboardService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.statCards[0].value = data.totalPacientes;
        this.statCards[1].value = data.totalMedicos;
        this.statCards[2].value = data.totalCitasProgramadas;
        this.statCards[3].value = data.totalCitasHoy;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDashboardMedico(): void {
    this.cargandoMedico = true;
    this.medicoService.obtenerMiPerfil().subscribe({
      next: (medico) => {
        this.miMedicoId = medico.id!;
        this.miEspecialidad = medico.especialidadNombre || '';
        this.citaService.listarPorMedico(medico.id!).subscribe({
          next: (citas) => {
            const hoy = new Date().toISOString().split('T')[0];
            this.citasHoy = citas.filter(c =>
              c.fecha === hoy && c.estado !== 'CANCELADA'
            );
            this.citasPendientes = citas.filter(c =>
              c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA'
            );
            const pacienteIds = new Set(citas.map(c => c.pacienteId));
            this.totalPacientes = pacienteIds.size;
            this.cargandoMedico = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargandoMedico = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.cargandoMedico = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDashboardRecepcionista(): void {
    this.cargandoRecepcionista = true;

    this.citaService.listarTodos().subscribe({
      next: (citas) => {
        const hoy = new Date().toISOString().split('T')[0];
        this.citasHoyTotal = citas.filter(c => c.fecha === hoy && c.estado !== 'CANCELADA');
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.pacienteService.listarActivos().subscribe({
      next: (pacientes) => {
        this.totalPacientesActivos = pacientes.length;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.pagoService.listarTodos().subscribe({
      next: (pagos) => {
        const hoy = new Date().toISOString().split('T')[0];
        this.pagosPendientes = pagos.filter(p => p.estado === 'PENDIENTE');
        this.totalRecaudadoHoy = pagos
          .filter(p => p.estado === 'PAGADO' && p.fecha === hoy)
          .reduce((sum, p) => sum + Number(p.monto), 0);
        this.cargandoRecepcionista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoRecepcionista = false;
        this.cdr.detectChanges();
      }
    });
  }

  irA(route: string): void {
    this.router.navigate([route]);
  }

  getSaludo(): string {
    const hora = this.horaActual.getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getFechaHoy(): string {
    return this.horaActual.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getEstadoBadge(estado: string): string {
    const clases: Record<string, string> = {
      'PROGRAMADA': 'badge-info',
      'CONFIRMADA': 'badge-success',
      'ATENDIDA': 'badge-done',
      'CANCELADA': 'badge-danger'
    };
    return clases[estado] || 'badge-info';
  }
}
