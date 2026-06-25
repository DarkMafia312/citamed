import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MedicoService } from '../../core/services/medico.service';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { NotificationService } from '../../core/services/notification.service';
import { Especialidad } from '../../core/models/especialidad.model';

@Component({
  selector: 'app-medicos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medicos-form.html',
  styleUrl: './medicos-form.scss'
})
export class MedicosForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  medicoId: number | null = null;
  cargando = false;
  guardando = false;
  mostrarPassword = false;

  generos = ['MASCULINO', 'FEMENINO'];
  especialidades: Especialidad[] = [];

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      cmp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
      correo: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      genero: ['', Validators.required],
      descripcion: ['', Validators.maxLength(255)],
      especialidadId: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9._]+$/)]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.cargarEspecialidades();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.medicoId = +id;
      // En edición la contraseña no es obligatoria
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
      this.cargarMedico(this.medicoId);
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  cargarEspecialidades(): void {
    this.especialidadService.listarTodos().subscribe({
      next: (data) => this.especialidades = data,
      error: () => this.notification.error('Error al cargar especialidades')
    });
  }

  cargarMedico(id: number): void {
    this.cargando = true;
    this.medicoService.buscarPorId(id).subscribe({
      next: (medico) => {
        if (!medico.activo) {
          this.notification.warning('No se puede editar un médico deshabilitado. Habilítalo primero.');
          this.router.navigate(['/dashboard/medicos']);
          return;
        }
        this.form.patchValue({
          nombre: medico.nombre,
          apellido: medico.apellido,
          cmp: medico.cmp,
          correo: medico.correo || '',
          telefono: medico.telefono || '',
          genero: medico.genero || '',
          descripcion: medico.descripcion || '',
          especialidadId: medico.especialidadId || '',
          username: medico.username || ''
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar la información del médico');
        this.router.navigate(['/dashboard/medicos']);
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
    const data = { ...this.form.value };

    if (this.esEdicion && !data.password) {
      delete data.password;
    }

    const accion = this.esEdicion
      ? this.medicoService.actualizar(this.medicoId!, data)
      : this.medicoService.crear(data);

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success(`Médico ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`);
        this.router.navigate(['/dashboard/medicos']);
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el médico');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/medicos']);
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

  cmpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get('cmp')?.setValue(valorFiltrado, { emitEvent: false });
    }
  }

  usernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get('username')?.setValue(valorFiltrado, { emitEvent: false });
    }
  }
}
