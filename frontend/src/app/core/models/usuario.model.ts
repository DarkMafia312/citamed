export interface Usuario {
  id?: number;
  username: string;
  rol: 'ADMIN' | 'MEDICO' | 'RECEPCIONISTA';
  activo?: boolean;
}
