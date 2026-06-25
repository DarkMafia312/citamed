export interface Pago {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  recepcionistaId?: number;
  recepcionistaNombre?: string;
  citaId?: number;
  monto: number;
  fecha?: string;
  estado?: 'PENDIENTE' | 'PAGADO' | 'ANULADO';
  concepto?: string;
  metodoPago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  numeroBoleta?: string;
  fechaCreacion?: string;
}
