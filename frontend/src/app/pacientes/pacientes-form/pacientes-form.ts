import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../core/services/paciente.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-pacientes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './pacientes-form.html',
  styleUrl: './pacientes-form.scss'
})
export class PacientesForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  pacienteId: number | null = null;
  cargando = false;
  guardando = false;

  generos = ['MASCULINO', 'FEMENINO'];
  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // ===== Selectores de fecha =====
  diaNacimiento = '';
  mesNacimiento = '';
  anioNacimiento = '';

  meses = [
    { valor: '01', nombre: 'Enero' }, { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' }, { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' }, { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' }, { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' }, { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' }, { valor: '12', nombre: 'Diciembre' }
  ];

  get diasDelMes(): number[] {
    if (!this.mesNacimiento || !this.anioNacimiento) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    const diasEnMes = new Date(Number(this.anioNacimiento), Number(this.mesNacimiento), 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => i + 1);
  }

  get aniosDisponibles(): number[] {
    const anioActual = new Date().getFullYear();
    const anios: number[] = [];
    for (let a = anioActual; a >= 1900; a--) {
      anios.push(a);
    }
    return anios;
  }

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      direccion: ['', [Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ°#.,\- ]*$/)]],
      correo: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      tipoSangre: [''],
      seguroMedico: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/)]],
      alergias: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.pacienteId = +id;
      this.cargarPaciente(this.pacienteId);
    }
  }

  onFechaCambio(): void {
    if (this.diaNacimiento && this.mesNacimiento && this.anioNacimiento) {
      const dia = String(this.diaNacimiento).padStart(2, '0');
      const fecha = `${this.anioNacimiento}-${this.mesNacimiento}-${dia}`;
      this.form.get('fechaNacimiento')?.setValue(fecha);
      this.form.get('fechaNacimiento')?.markAsTouched();
    } else {
      this.form.get('fechaNacimiento')?.setValue('');
    }
  }

  cargarPaciente(id: number): void {
    this.cargando = true;
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        if (!paciente.activo) {
          this.notification.warning('No se puede editar un paciente deshabilitado. Habilítalo primero.');
          this.router.navigate(['/dashboard/pacientes']);
          return;
        }

        if (paciente.fechaNacimiento) {
          const partes = paciente.fechaNacimiento.split('-');
          this.anioNacimiento = partes[0];
          this.mesNacimiento = partes[1];
          this.diaNacimiento = String(Number(partes[2]));
        }

        this.form.patchValue({
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          dni: paciente.dni,
          fechaNacimiento: paciente.fechaNacimiento,
          genero: paciente.genero,
          telefono: paciente.telefono || '',
          direccion: paciente.direccion || '',
          correo: paciente.correo || '',
          tipoSangre: paciente.tipoSangre || '',
          seguroMedico: paciente.seguroMedico || '',
          alergias: paciente.alergias || ''
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar la información del paciente');
        this.router.navigate(['/dashboard/pacientes']);
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
    const data = this.form.value;

    const accion = this.esEdicion
      ? this.pacienteService.actualizar(this.pacienteId!, data)
      : this.pacienteService.crear(data);

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success(`Paciente ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`);
        this.router.navigate(['/dashboard/pacientes']);
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el paciente');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/pacientes']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  soloLetras(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get(campo)?.setValue(valorFiltrado, { emitEvent: false });
    }
  }

  soloNumeros(event: Event, campo: string, maxLength: number): void {
    const input = event.target as HTMLInputElement;
    let valorFiltrado = input.value.replace(/[^0-9]/g, '');
    if (valorFiltrado.length > maxLength) {
      valorFiltrado = valorFiltrado.slice(0, maxLength);
    }
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get(campo)?.setValue(valorFiltrado, { emitEvent: false });
    }
  }

  direccionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ°#.,\- ]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get('direccion')?.setValue(valorFiltrado, { emitEvent: false });
    }
  }
}
