import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HistorialMedicoService } from '../../core/services/historial-medico.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { CitaService } from '../../core/services/cita.service';
import { HorarioMedicoService } from '../../core/services/horario-medico.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Paciente } from '../../core/models/paciente.model';
import { Cita } from '../../core/models/cita.model';
import { Medico } from '../../core/models/medico.model';
import { HorarioMedico } from '../../core/models/horario-medico.model';

@Component({
  selector: 'app-historial-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './historial-form.html',
  styleUrl: './historial-form.scss'
})
export class HistorialForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  historialId: number | null = null;
  cargando = false;
  guardando = false;
  soloLectura = false;
  rol: string | null = '';
  miMedicoId: number | null = null;
  miMedicoNombre = '';

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  citasDelPaciente: Cita[] = [];

  horariosMedico: HorarioMedico[] = [];
  diasDisponibles: Set<number> = new Set();
  mostrarCalendario = false;
  mesActual = new Date();

  private diaSemanaAJsDay: Record<string, number> = {
    'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3,
    'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
  };

  constructor(
    private fb: FormBuilder,
    private historialService: HistorialMedicoService,
    private pacienteService: PacienteService,
    private medicoService: MedicoService,
    private citaService: CitaService,
    private horarioMedicoService: HorarioMedicoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      medicoId: ['', Validators.required],
      citaId: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      diagnostico: ['', Validators.maxLength(255)],
      tratamiento: ['', Validators.maxLength(255)],
      medicamentos: ['', Validators.maxLength(255)],
      observaciones: ['', Validators.maxLength(255)],
      proximaCita: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.historialId = +id;
      this.cargando = true;
    }

    this.soloLectura = this.rol === 'RECEPCIONISTA';

    if (this.rol === 'MEDICO') {
      this.medicoService.obtenerMiPerfil().subscribe({
        next: (medico) => {
          this.miMedicoId = medico.id!;
          this.miMedicoNombre = `${medico.nombre} ${medico.apellido}`;
          this.form.patchValue({ medicoId: medico.id });
          this.form.get('medicoId')?.disable();
          this.cargarHorariosMedico(medico.id!);
          this.cargarPacientes();
          if (this.historialId) {
            this.cargarHistorial(this.historialId);
          } else {
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
          this.notification.error('No se pudo cargar tu perfil de médico');
        }
      });
    } else {
      this.cargarPacientes();
      this.cargarMedicos();
      if (this.historialId) {
        this.cargarHistorial(this.historialId);
      }
    }

    if (this.soloLectura) {
      this.form.disable();
    }
  }

  cargarPacientes(): void {
    this.pacienteService.listarTodos().subscribe({
      next: (data) => {
        this.pacientes = data.filter(p => p.activo);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar pacientes')
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

  onMedicoChange(): void {
    const medicoId = this.form.get('medicoId')?.value;
    this.diasDisponibles.clear();
    this.form.get('proximaCita')?.setValue('');
    if (medicoId) {
      this.cargarHorariosMedico(Number(medicoId));
    }
  }

  onPacienteChange(): void {
    const pacienteId = this.form.get('pacienteId')?.value;
    this.form.get('citaId')?.setValue('');
    this.citasDelPaciente = [];

    if (!pacienteId) return;

    this.citaService.listarPorPaciente(Number(pacienteId)).subscribe({
      next: (data) => {
        this.citasDelPaciente = this.rol === 'MEDICO'
          ? data.filter(c => c.medicoId === this.miMedicoId)
          : data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar las citas del paciente')
    });
  }

  cargarHistorial(id: number): void {
    this.cargando = true;
    this.historialService.buscarPorId(id).subscribe({
      next: (historial) => {
        if (this.rol === 'MEDICO' && historial.medicoId !== this.miMedicoId) {
          this.notification.warning('Solo puedes ver este registro, no editarlo, porque no es tuyo');
          this.soloLectura = true;
          this.form.disable();
        }

        this.form.patchValue({
          pacienteId: historial.pacienteId,
          medicoId: historial.medicoId,
          citaId: historial.citaId || '',
          descripcion: historial.descripcion,
          diagnostico: historial.diagnostico || '',
          tratamiento: historial.tratamiento || '',
          medicamentos: historial.medicamentos || '',
          observaciones: historial.observaciones || '',
          proximaCita: historial.proximaCita || ''
        });

        if (this.rol !== 'MEDICO') {
          this.cargarHorariosMedico(historial.medicoId);
        }

        this.citaService.listarPorPaciente(historial.pacienteId).subscribe({
          next: (citas) => {
            this.citasDelPaciente = citas;
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar el registro');
        this.router.navigate(['/dashboard/historial']);
      }
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

  seleccionarDia(diaInfo: { fecha: string, disponible: boolean }): void {
    if (!diaInfo.disponible) return;
    this.form.get('proximaCita')?.setValue(diaInfo.fecha);
    this.mostrarCalendario = false;
  }

  toggleCalendario(): void {
    if (this.soloLectura) return;
    const medicoId = this.form.get('medicoId')?.value || this.miMedicoId;
    if (medicoId) {
      this.mostrarCalendario = !this.mostrarCalendario;
    } else {
      this.notification.warning('Selecciona primero un médico para ver su disponibilidad');
    }
  }

  formatearFechaSeleccionada(): string {
    const valor = this.form.get('proximaCita')?.value;
    if (!valor) return '';
    const [año, mes, dia] = valor.split('-');
    const fecha = new Date(Number(año), Number(mes) - 1, Number(dia));
    return fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  onSubmit(): void {
    if (this.soloLectura) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Revisa los campos marcados en rojo');
      return;
    }

    this.guardando = true;
    const valores = this.form.getRawValue();

    const data: any = {
      pacienteId: Number(valores.pacienteId),
      medicoId: Number(valores.medicoId),
      citaId: Number(valores.citaId),
      descripcion: valores.descripcion,
      diagnostico: valores.diagnostico,
      tratamiento: valores.tratamiento,
      medicamentos: valores.medicamentos,
      observaciones: valores.observaciones,
      proximaCita: valores.proximaCita
    };

    const accion = this.esEdicion
      ? this.historialService.actualizar(this.historialId!, data)
      : this.historialService.crear(data);

    accion.subscribe({
      next: () => {
        this.notification.success(`Registro ${this.esEdicion ? 'actualizado' : 'creado'} correctamente`);
        this.router.navigate(['/dashboard/historial']);
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el registro');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/historial']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
