import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ConsultorioService } from '../../core/services/consultorio.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-consultorios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './consultorios-form.html',
  styleUrl: './consultorios-form.scss'
})
export class ConsultoriosForm implements OnInit {
  form: FormGroup;
  esEdicion = false;
  consultorioId: number | null = null;
  cargando = false;
  guardando = false;

  tipos = ['Consultorio General', 'Consultorio Especializado', 'Sala de Procedimientos', 'Sala de Emergencia'];

  constructor(
    private fb: FormBuilder,
    private consultorioService: ConsultorioService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^C-[0-9]{3}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tipo: ['', Validators.maxLength(100)],
      piso: ['', Validators.maxLength(10)],
      descripcion: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion = true;
      this.consultorioId = +id;
      this.cargarConsultorio(this.consultorioId);
    }
  }

  cargarConsultorio(id: number): void {
    this.cargando = true;
    this.consultorioService.buscarPorId(id).subscribe({
      next: (consultorio) => {
        if (!consultorio.disponible) {
          this.notification.warning('No se puede editar un consultorio deshabilitado. Habilítalo primero.');
          this.router.navigate(['/dashboard/consultorios']);
          return;
        }
        this.form.patchValue({
          codigo: consultorio.codigo,
          nombre: consultorio.nombre,
          tipo: consultorio.tipo || '',
          piso: consultorio.piso || '',
          descripcion: consultorio.descripcion || ''
        });
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.cargando = false;
        setTimeout(() => this.cdr.detectChanges());
        this.notification.error('No se pudo cargar la información del consultorio');
        this.router.navigate(['/dashboard/consultorios']);
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
      ? this.consultorioService.actualizar(this.consultorioId!, data)
      : this.consultorioService.crear(data);

    accion.subscribe({
      next: () => {
        this.notification.success(`Consultorio ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`);
        this.router.navigate(['/dashboard/consultorios']);
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.notification.error(err.error?.mensaje || 'Ocurrió un error al guardar el consultorio');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/consultorios']);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  codigoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.toUpperCase();
    valor = valor.replace(/[^C0-9-]/g, '');
    if (valor !== input.value) {
      input.value = valor;
      this.form.get('codigo')?.setValue(valor, { emitEvent: false });
    }
  }

  pisoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.replace(/[^a-zA-Z0-9° ]/g, '');
    if (valorFiltrado !== input.value) {
      input.value = valorFiltrado;
      this.form.get('piso')?.setValue(valorFiltrado, { emitEvent: false });
    }
  }
}
