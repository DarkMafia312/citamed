import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CitaService } from '../../core/services/cita.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { ConsultorioService } from '../../core/services/consultorio.service';
import { HorarioMedicoService } from '../../core/services/horario-medico.service';
import { NotificationService } from '../../core/services/notification.service';
import { Paciente } from '../../core/models/paciente.model';
import { Medico } from '../../core/models/medico.model';
import { Consultorio } from '../../core/models/consultorio.model';
import { HorarioMedico } from '../../core/models/horario-medico.model';

@Component({
  selector: 'app-citas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './citas-form.html',
  styleUrl: './citas-form.scss'
})
export class CitasForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  citaId: number | null = null;
  cargando = false;
  guardando = false;

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  consultorios: Consultorio[] = [];

  fechaMinima: string;

  horariosMedico: HorarioMedico[] = [];
  diasDisponibles: Set<number> = new Set();
  mostrarCalendario = false;
  mesActual = new Date();

  // ===== Selector de horas =====
  horasDisponibles: string[] = [];
  citasOcupadasDelDia: string[] = [];
  mostrarSelectorHora = false;

  private diaSemanaAJsDay: Record<string, number> = {
    'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3,
    'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
  };

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private medicoService: MedicoService,
    private consultorioService: ConsultorioService,
    private horarioMedicoService: HorarioMedicoService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];

    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      medicoId: ['', Validators.required],
      consultorioId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(255)]],
      observaciones: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.citaId = +id;
      this.cargarCita(this.citaId);
    }
  }

  cargarDatos(): void {
    this.pacienteService.listarTodos().subscribe({
      next: (data) => {
        this.pacientes = data.filter(p => p.activo);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar pacientes')
    });

    this.medicoService.listarActivos().subscribe({
      next: (data) => {
        this.medicos = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar médicos')
    });

    this.consultorioService.listarTodos().subscribe({
      next: (data) => {
        this.consultorios = data.filter(c => c.disponible);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar consultorios')
    });
  }

  cargarCita(id: number): void {
    this.cargando = true;
    this.citaService.buscarPorId(id).subscribe({
      next: (cita) => {
        if (cita.estado === 'CANCELADA' || cita.estado === 'ATENDIDA') {
          this.notification.warning(`No se puede editar una cita ${cita.estado?.toLowerCase()}`);
          this.router.navigate(['/dashboard/citas']);
          return;
        }
        this.form.patchValue({
          pacienteId: cita.pacienteId,
          medicoId: cita.medicoId,
          consultorioId: cita.consultorioId || '',
          fecha: cita.fecha,
          hora: cita.hora?.substring(0, 5),
          motivo: cita.motivo || '',
          observaciones: cita.observaciones || ''
        });
        this.cargarHorariosMedico(cita.medicoId);
        if (cita.fecha) {
          this.cargarCitasDelDia(cita.medicoId, cita.fecha, cita.id);
        }
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
        this.notification.error('No se pudo cargar la información de la cita');
        this.router.navigate(['/dashboard/citas']);
      }
    });
  }

  onMedicoChange(): void {
    const medicoId = this.form.get('medicoId')?.value;
    this.diasDisponibles.clear();
    this.horasDisponibles = [];
    this.form.get('fecha')?.setValue('');
    this.form.get('hora')?.setValue('');
    if (medicoId) {
      this.cargarHorariosMedico(Number(medicoId));
    }
  }

  cargarHorariosMedico(medicoId: number): void {
    this.horarioMedicoService.listarPorMedico(medicoId).subscribe({
      next: (horarios) => {
        this.horariosMedico = horarios.filter(h => h.disponible);
        this.diasDisponibles = new Set(
          this.horariosMedico.map(h => this.diaSemanaAJsDay[h.diaSemana])
        );
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar el horario del médico')
    });
  }

  get diasDelMes(): { dia: number, fecha: string, disponible: boolean, esHoy: boolean }[] {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias: { dia: number, fecha: string, disponible: boolean, esHoy: boolean }[] = [];

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fechaObj = new Date(año, mes, d);
      const jsDay = fechaObj.getDay();
      const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const esPasado = fechaObj < hoy;
      dias.push({
        dia: d,
        fecha: fechaStr,
        disponible: this.diasDisponibles.has(jsDay) && !esPasado,
        esHoy: fechaObj.getTime() === hoy.getTime()
      });
    }
    return dias;
  }

  get diasVaciosInicio(): number[] {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    return Array(primerDia).fill(0);
  }

  get nombreMesActual(): string {
    return this.mesActual.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  }

  mesAnterior(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
  }

  mesSiguiente(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
  }

  toggleCalendario(): void {
    const medicoId = this.form.get('medicoId')?.value;
    if (medicoId) {
      this.mostrarCalendario = !this.mostrarCalendario;
      this.mostrarSelectorHora = false;
    } else {
      this.notification.warning('Selecciona primero un médico para ver su disponibilidad');
    }
  }

  seleccionarDia(diaInfo: { fecha: string, disponible: boolean }): void {
    if (!diaInfo.disponible) return;
    this.form.get('fecha')?.setValue(diaInfo.fecha);
    this.form.get('hora')?.setValue('');
    this.mostrarCalendario = false;

    const medicoId = Number(this.form.get('medicoId')?.value);
    this.cargarCitasDelDia(medicoId, diaInfo.fecha, this.citaId || undefined);
  }

  formatearFechaSeleccionada(): string {
    const valor = this.form.get('fecha')?.value;
    if (!valor) return '';
    const [año, mes, dia] = valor.split('-');
    const fecha = new Date(Number(año), Number(mes) - 1, Number(dia));
    return fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  cargarCitasDelDia(medicoId: number, fecha: string, excluirCitaId?: number): void {
    this.citaService.listarPorMedico(medicoId).subscribe({
      next: (citas) => {
        this.citasOcupadasDelDia = citas
          .filter(c => c.fecha === fecha && c.estado !== 'CANCELADA' && c.id !== excluirCitaId)
          .map(c => c.hora.substring(0, 5));
        this.generarHorasDisponibles(fecha);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al verificar disponibilidad de horario')
    });
  }

  generarHorasDisponibles(fecha: string): void {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const jsDay = fechaObj.getDay();

    const diaSemanaTexto = Object.keys(this.diaSemanaAJsDay).find(
      key => this.diaSemanaAJsDay[key] === jsDay
    );

    const horarioDelDia = this.horariosMedico.find(h => h.diaSemana === diaSemanaTexto);
    if (!horarioDelDia) {
      this.horasDisponibles = [];
      return;
    }

    const horas: string[] = [];
    const [horaIni, minIni] = horarioDelDia.horaInicio.substring(0, 5).split(':').map(Number);
    const [horaFin, minFin] = horarioDelDia.horaFin.substring(0, 5).split(':').map(Number);

    let actual = horaIni * 60 + minIni;
    const fin = horaFin * 60 + minFin;

    while (actual < fin) {
      const h = Math.floor(actual / 60);
      const m = actual % 60;
      const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      horas.push(horaStr);
      actual += 30;
    }

    this.horasDisponibles = horas;
  }

  toggleSelectorHora(): void {
    if (!this.form.get('fecha')?.value) {
      this.notification.warning('Selecciona primero una fecha disponible');
      return;
    }
    this.mostrarSelectorHora = !this.mostrarSelectorHora;
    this.mostrarCalendario = false;
  }

  seleccionarHora(hora: string): void {
    if (this.citasOcupadasDelDia.includes(hora)) return;
    this.form.get('hora')?.setValue(hora);
    this.mostrarSelectorHora = false;
  }

  horaOcupada(hora: string): boolean {
    return this.citasOcupadasDelDia.includes(hora);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Revisa los campos marcados en rojo');
      return;
    }

    this.guardando = true;
    const data = {
      pacienteId: Number(this.form.value.pacienteId),
      medicoId: Number(this.form.value.medicoId),
      consultorioId: Number(this.form.value.consultorioId),
      fecha: this.form.value.fecha,
      hora: this.form.value.hora,
      motivo: this.form.value.motivo,
      observaciones: this.form.value.observaciones
    };

    const accion = this.esEdicion
      ? this.citaService.actualizar(this.citaId!, data)
      : this.citaService.crear(data);

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success(`Cita ${this.esEdicion ? 'actualizada' : 'registrada'} correctamente`);
        this.router.navigate(['/dashboard/citas']);
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar la cita');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/citas']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
