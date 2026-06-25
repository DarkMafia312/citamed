import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-especialidades-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './especialidades-form.html',
  styleUrl: './especialidades-form.scss'
})
export class EspecialidadesForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  especialidadId: number | null = null;
  cargando = false;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private especialidadService: EspecialidadService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      descripcion: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.especialidadId = +id;
      this.cargarEspecialidad(this.especialidadId);
    }
  }

  cargarEspecialidad(id: number): void {
    this.cargando = true;
    this.especialidadService.buscarPorId(id).subscribe({
      next: (especialidad) => {
        this.form.patchValue({
          nombre: especialidad.nombre,
          descripcion: especialidad.descripcion || ''
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar la información de la especialidad');
        this.router.navigate(['/dashboard/especialidades']);
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
      ? this.especialidadService.actualizar(this.especialidadId!, data)
      : this.especialidadService.crear(data);

    accion.subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success(`Especialidad ${this.esEdicion ? 'actualizada' : 'registrada'} correctamente`);
        this.router.navigate(['/dashboard/especialidades']);
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar la especialidad');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/especialidades']);
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
}
