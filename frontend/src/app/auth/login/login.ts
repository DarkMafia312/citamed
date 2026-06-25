import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialog],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.cargando = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Token JWT:', response.token);
        console.log('Usuario:', response.username);
        console.log('Rol:', response.rol);
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();

        const mensaje = err.error?.mensaje || 'Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.';

        this.confirmDialog.confirm({
          title: 'No se pudo iniciar sesión',
          message: mensaje,
          confirmText: 'Entendido',
          type: 'error'
        });
      }
    });
  }
}
