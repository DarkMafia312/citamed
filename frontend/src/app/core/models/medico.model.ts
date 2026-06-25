export interface Medico {
  id?: number;
  nombre: string;
  apellido: string;
  cmp: string;
  correo?: string;
  telefono?: string;
  genero?: string;
  descripcion?: string;
  especialidadId?: number;
  especialidadNombre?: string;
  usuarioId?: number;
  username?: string;
  password?: string;
  activo?: boolean;
}
