import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HorarioMedicoService } from '../../core/services/horario-medico.service';
import { MedicoService } from '../../core/services/medico.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Medico } from '../../core/models/medico.model';

@Component({
  selector: 'app-horarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './horarios-form.html',
  styleUrl: './horarios-form.scss'
})
export class HorariosForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  horarioId: number | null = null;
  cargando = false;
  guardando = false;
  rol: string | null = '';
  miMedicoId: number | null = null;
  miMedicoNombre: string = '';

  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  diasSeleccionados: string[] = [];
  diasTouched = false;

  medicos: Medico[] = [];

  constructor(
    private fb: FormBuilder,
    private horarioService: HorarioMedicoService,
    private medicoService: MedicoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
    this.form = this.fb.group({
      medicoId: ['', Validators.required],
      diaSemana: [''],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required]
    }, { validators: this.horarioValido });
  }

  horarioValido(group: AbstractControl): ValidationErrors | null {
    const inicio = group.get('horaInicio')?.value;
    const fin = group.get('horaFin')?.value;
    if (inicio && fin && inicio >= fin) {
      return { horarioInvalido: true };
    }
    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.horarioId = +id;
      this.cargando = true;
      this.form.get('diaSemana')?.setValidators([Validators.required]);
      this.form.get('diaSemana')?.updateValueAndValidity();
    }

    if (this.rol === 'MEDICO') {
      this.medicoService.obtenerMiPerfil().subscribe({
        next: (medico) => {
          this.miMedicoId = medico.id!;
          this.miMedicoNombre = `${medico.nombre} ${medico.apellido}`;
          this.form.patchValue({ medicoId: medico.id });
          this.form.get('medicoId')?.disable();
          if (this.horarioId) {
            this.cargarHorario(this.horarioId);
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
      this.cargarMedicos();
      if (this.horarioId) {
        this.cargarHorario(this.horarioId);
      }
    }
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

  cargarHorario(id: number): void {
    this.cargando = true;
    this.horarioService.buscarPorId(id).subscribe({
      next: (horario) => {
        if (!horario.disponible) {
          this.notification.warning('No se puede editar un horario deshabilitado. Habilítalo primero.');
          this.router.navigate(['/dashboard/horarios']);
          return;
        }
        if (this.rol === 'MEDICO' && horario.medicoId !== this.miMedicoId) {
          this.notification.error('No tienes permiso para editar este horario');
          this.router.navigate(['/dashboard/horarios']);
          return;
        }
        this.form.patchValue({
          medicoId: horario.medicoId,
          diaSemana: horario.diaSemana,
          horaInicio: horario.horaInicio?.substring(0, 5),
          horaFin: horario.horaFin?.substring(0, 5)
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar la información del horario');
        this.router.navigate(['/dashboard/horarios']);
      }
    });
  }

  toggleDia(dia: string): void {
    this.diasTouched = true;
    const index = this.diasSeleccionados.indexOf(dia);
    if (index >= 0) {
      this.diasSeleccionados.splice(index, 1);
    } else {
      this.diasSeleccionados.push(dia);
    }
  }

  diaSeleccionado(dia: string): boolean {
    return this.diasSeleccionados.includes(dia);
  }

  get diasInvalido(): boolean {
    return this.diasTouched && this.diasSeleccionados.length === 0;
  }

  onSubmit(): void {
    if (!this.esEdicion && this.diasSeleccionados.length === 0) {
      this.diasTouched = true;
      this.notification.error('Selecciona al menos un día para el horario');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['horarioInvalido']) {
        this.notification.error('La hora de inicio debe ser menor que la hora de fin');
      } else {
        this.notification.error('Revisa los campos marcados en rojo');
      }
      return;
    }

    this.guardando = true;
    const valores = this.form.getRawValue();

    if (this.esEdicion) {
      const data = {
        medicoId: Number(valores.medicoId),
        diaSemana: valores.diaSemana,
        horaInicio: valores.horaInicio,
        horaFin: valores.horaFin,
        disponible: true
      };

      this.horarioService.actualizar(this.horarioId!, data).subscribe({
        next: () => {
          this.guardando = false;
          this.notification.success('Horario actualizado correctamente');
          this.router.navigate(['/dashboard/horarios']);
        },
        error: (err) => {
          this.guardando = false;
          this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el horario');
        }
      });
    } else {
      const peticiones = this.diasSeleccionados.map(dia =>
        this.horarioService.crear({
          medicoId: valores.medicoId,
          diaSemana: dia,
          horaInicio: valores.horaInicio,
          horaFin: valores.horaFin
        })
      );

      forkJoin(peticiones).subscribe({
        next: () => {
          this.guardando = false;
          this.notification.success(`Horario registrado correctamente para ${this.diasSeleccionados.length} día(s)`);
          this.router.navigate(['/dashboard/horarios']);
        },
        error: (err) => {
          this.guardando = false;
          this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar uno o más horarios. Verifica que el médico no tenga ya un horario en alguno de esos días.');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/horarios']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  get horarioInvalido(): boolean {
    return !!this.form.errors?.['horarioInvalido'] &&
      (this.form.get('horaInicio')?.touched || false) &&
      (this.form.get('horaFin')?.touched || false);
  }
}
