import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/layout').then(m => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome)
      },
      {
        path: 'citas',
        children: [
          { path: '', loadComponent: () => import('./citas/citas-list/citas-list').then(m => m.CitasList) },
          { path: 'nuevo', loadComponent: () => import('./citas/citas-form/citas-form').then(m => m.CitasForm) },
          { path: 'editar/:id', loadComponent: () => import('./citas/citas-form/citas-form').then(m => m.CitasForm) }
        ]
      },
      {
        path: 'pacientes',
        children: [
          { path: '', loadComponent: () => import('./pacientes/pacientes-list/pacientes-list').then(m => m.PacientesList) },
          { path: 'nuevo', loadComponent: () => import('./pacientes/pacientes-form/pacientes-form').then(m => m.PacientesForm) },
          { path: 'editar/:id', loadComponent: () => import('./pacientes/pacientes-form/pacientes-form').then(m => m.PacientesForm) }
        ]
      },
      {
        path: 'medicos',
        children: [
          { path: '', loadComponent: () => import('./medicos/medicos-list/medicos-list').then(m => m.MedicosList) },
          { path: 'nuevo', loadComponent: () => import('./medicos/medicos-form/medicos-form').then(m => m.MedicosForm) },
          { path: 'editar/:id', loadComponent: () => import('./medicos/medicos-form/medicos-form').then(m => m.MedicosForm) }
        ]
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./medicos/mi-perfil/mi-perfil').then(m => m.MiPerfil)
      },
      {
        path: 'mi-perfil-recepcionista',
        loadComponent: () => import('./recepcionistas/mi-perfil-recepcionista/mi-perfil-recepcionista').then(m => m.MiPerfilRecepcionista)
      },
      {
        path: 'especialidades',
        children: [
          { path: '', loadComponent: () => import('./especialidades/especialidades-list/especialidades-list').then(m => m.EspecialidadesList) },
          { path: 'nuevo', loadComponent: () => import('./especialidades/especialidades-form/especialidades-form').then(m => m.EspecialidadesForm) },
          { path: 'editar/:id', loadComponent: () => import('./especialidades/especialidades-form/especialidades-form').then(m => m.EspecialidadesForm) }
        ]
      },
      {
        path: 'consultorios',
        children: [
          { path: '', loadComponent: () => import('./consultorios/consultorios-list/consultorios-list').then(m => m.ConsultoriosList) },
          { path: 'nuevo', loadComponent: () => import('./consultorios/consultorios-form/consultorios-form').then(m => m.ConsultoriosForm) },
          { path: 'editar/:id', loadComponent: () => import('./consultorios/consultorios-form/consultorios-form').then(m => m.ConsultoriosForm) }
        ]
      },
      {
        path: 'horarios',
        children: [
          { path: '', loadComponent: () => import('./horarios/horarios-list/horarios-list').then(m => m.HorariosList) },
          { path: 'nuevo', loadComponent: () => import('./horarios/horarios-form/horarios-form').then(m => m.HorariosForm) },
          { path: 'editar/:id', loadComponent: () => import('./horarios/horarios-form/horarios-form').then(m => m.HorariosForm) }
        ]
      },
      {
        path: 'historial',
        children: [
          { path: '', loadComponent: () => import('./historial/historial-list/historial-list').then(m => m.HistorialList) },
          { path: 'nuevo', loadComponent: () => import('./historial/historial-form/historial-form').then(m => m.HistorialForm) },
          { path: 'editar/:id', loadComponent: () => import('./historial/historial-form/historial-form').then(m => m.HistorialForm) }
        ]
      },
      {
        path: 'pagos',
        children: [
          { path: '', loadComponent: () => import('./pagos/pagos-list/pagos-list').then(m => m.PagosList) },
          { path: 'nuevo', loadComponent: () => import('./pagos/pagos-form/pagos-form').then(m => m.PagosForm) },
          { path: 'editar/:id', loadComponent: () => import('./pagos/pagos-form/pagos-form').then(m => m.PagosForm) }
        ]
      },
      {
        path: 'recepcionistas',
        children: [
          { path: '', loadComponent: () => import('./recepcionistas/recepcionistas-list/recepcionistas-list').then(m => m.RecepcionistasList) },
          { path: 'nuevo', loadComponent: () => import('./recepcionistas/recepcionistas-form/recepcionistas-form').then(m => m.RecepcionistasForm) },
          { path: 'editar/:id', loadComponent: () => import('./recepcionistas/recepcionistas-form/recepcionistas-form').then(m => m.RecepcionistasForm) }
        ]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios-list/usuarios-list').then(m => m.UsuariosList)
      }
    ]
  }
];
