export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  genero: string;
  telefono?: string;
  direccion?: string;
  correo?: string;
  tipoSangre?: string;
  seguroMedico?: string;
  alergias?: string;
  recepcionistaId?: number;
  recepcionistaNombre?: string;
  activo?: boolean;
}
