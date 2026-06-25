import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PagoService } from '../../core/services/pago.service';
import { PacienteService } from '../../core/services/paciente.service';
import { RecepcionistaService } from '../../core/services/recepcionista.service';
import { CitaService } from '../../core/services/cita.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Paciente } from '../../core/models/paciente.model';
import { Cita } from '../../core/models/cita.model';

@Component({
  selector: 'app-pagos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pagos-form.html',
  styleUrl: './pagos-form.scss'
})
export class PagosForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  pagoId: number | null = null;
  cargando = false;
  guardando = false;
  rol: string | null = '';
  miRecepcionistaId: number | null = null;

  pacientes: Paciente[] = [];
  citasDelPaciente: Cita[] = [];

  metodosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    private pacienteService: PacienteService,
    private recepcionistaService: RecepcionistaService,
    private citaService: CitaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.rol = this.authService.getRol();
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      citaId: [''],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      concepto: ['', Validators.maxLength(255)],
      metodoPago: ['', Validators.required],
      numeroBoleta: ['', Validators.maxLength(50)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.pagoId = +id;
      this.cargando = true;
    }

    this.cargarPacientes();

    if (this.rol === 'RECEPCIONISTA') {
      this.recepcionistaService.obtenerMiPerfil().subscribe({
        next: (recep) => {
          this.miRecepcionistaId = recep.id!;
          if (this.pagoId) this.cargarPago(this.pagoId);
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
          this.notification.error('No se pudo cargar tu perfil de recepcionista');
        }
      });
    } else if (this.pagoId) {
      this.cargarPago(this.pagoId);
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

  onPacienteChange(): void {
    const pacienteId = this.form.get('pacienteId')?.value;
    this.form.get('citaId')?.setValue('');
    this.citasDelPaciente = [];

    if (!pacienteId) return;

    this.citaService.listarPorPaciente(Number(pacienteId)).subscribe({
      next: (data) => {
        this.citasDelPaciente = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Error al cargar las citas del paciente')
    });
  }

  cargarPago(id: number): void {
    this.pagoService.buscarPorId(id).subscribe({
      next: (pago) => {
        if (pago.estado !== 'PENDIENTE') {
          this.notification.warning('Solo se pueden editar pagos en estado PENDIENTE');
          this.router.navigate(['/dashboard/pagos']);
          return;
        }
        this.form.patchValue({
          pacienteId: pago.pacienteId,
          citaId: pago.citaId || '',
          monto: pago.monto,
          concepto: pago.concepto || '',
          metodoPago: pago.metodoPago || '',
          numeroBoleta: pago.numeroBoleta || ''
        });
        if (pago.pacienteId) {
          this.citaService.listarPorPaciente(pago.pacienteId).subscribe({
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
        } else {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar el pago');
        this.router.navigate(['/dashboard/pagos']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Revisa los campos marcados en rojo');
      return;
    }

    this.guardando = true;
    const valores = this.form.value;

    const data: any = {
      pacienteId: Number(valores.pacienteId),
      citaId: valores.citaId ? Number(valores.citaId) : null,
      monto: Number(valores.monto),
      concepto: valores.concepto,
      metodoPago: valores.metodoPago,
      numeroBoleta: valores.numeroBoleta
    };

    if (this.rol === 'RECEPCIONISTA' && this.miRecepcionistaId) {
      data.recepcionistaId = this.miRecepcionistaId;
    }

    const accion = this.esEdicion
      ? this.pagoService.actualizar(this.pagoId!, data)
      : this.pagoService.crear(data);

    accion.subscribe({
      next: () => {
        this.notification.success(`Pago ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`);
        this.router.navigate(['/dashboard/pagos']);
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el pago');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/pagos']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
