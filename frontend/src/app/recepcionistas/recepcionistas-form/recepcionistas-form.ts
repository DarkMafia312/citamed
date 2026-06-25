import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RecepcionistaService } from '../../core/services/recepcionista.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-recepcionistas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recepcionistas-form.html',
  styleUrl: './recepcionistas-form.scss'
})
export class RecepcionistasForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  recepcionistaId: number | null = null;
  cargando = false;
  guardando = false;
  mostrarPassword = false;

  constructor(
    private fb: FormBuilder,
    private recepcionistaService: RecepcionistaService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      dni: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      correo: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9._]+$/)]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.recepcionistaId = +id;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
      this.cargarRecepcionista(this.recepcionistaId);
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  cargarRecepcionista(id: number): void {
    this.cargando = true;
    this.recepcionistaService.buscarPorId(id).subscribe({
      next: (recepcionista) => {
        if (!recepcionista.activo) {
          this.notification.warning('No se puede editar una recepcionista deshabilitada. Habilítala primero.');
          this.router.navigate(['/dashboard/recepcionistas']);
          return;
        }
        this.form.patchValue({
          nombre: recepcionista.nombre,
          apellido: recepcionista.apellido,
          dni: recepcionista.dni || '',
          correo: recepcionista.correo || '',
          telefono: recepcionista.telefono || '',
          username: recepcionista.username || ''
        });
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
        this.notification.error('No se pudo cargar la información de la recepcionista');
        this.router.navigate(['/dashboard/recepcionistas']);
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
      ? this.recepcionistaService.actualizar(this.recepcionistaId!, data)
      : this.recepcionistaService.crear(data);

    accion.subscribe({
      next: () => {
        this.notification.success(`Recepcionista ${this.esEdicion ? 'actualizada' : 'registrada'} correctamente`);
        this.router.navigate(['/dashboard/recepcionistas']);
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar la recepcionista');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/recepcionistas']);
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

  usernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get('username')?.setValue(valorFiltrado, { emitEvent: false });
    }
  }
}
