import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecepcionistaService } from '../../core/services/recepcionista.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-mi-perfil-recepcionista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mi-perfil-recepcionista.html',
  styleUrl: './mi-perfil-recepcionista.scss'
})
export class MiPerfilRecepcionista implements OnInit {
  form: FormGroup;
  cargando = true;
  guardando = false;
  mostrarPassword = false;
  modoEdicion = false;
  dniActual = '';
  usernameActual = '';

  constructor(
    private fb: FormBuilder,
    private recepcionistaService: RecepcionistaService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      correo: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.recepcionistaService.obtenerMiPerfil().subscribe({
      next: (recep) => {
        this.dniActual = recep.dni || '-';
        this.usernameActual = recep.username || '-';
        this.form.patchValue({
          nombre: recep.nombre,
          apellido: recep.apellido,
          telefono: recep.telefono || '',
          correo: recep.correo || ''
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.notification.error('No se pudo cargar tu información de perfil');
      }
    });
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.form.get('password')?.setValue('');
    this.cargarPerfil();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Revisa los campos marcados en rojo');
      return;
    }

    this.guardando = true;
    const data: any = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      telefono: this.form.value.telefono,
      correo: this.form.value.correo
    };

    if (this.form.value.password) {
      data.password = this.form.value.password;
    }

    this.recepcionistaService.actualizarMiPerfil(data).subscribe({
      next: () => {
        this.guardando = false;
        this.modoEdicion = false;
        this.form.get('password')?.setValue('');
        this.notification.success('Perfil actualizado correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al actualizar tu perfil');
      }
    });
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
}
