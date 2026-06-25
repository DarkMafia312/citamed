export interface Cita {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  pacienteDni?: string;
  medicoId: number;
  medicoNombre?: string;
  medicoEspecialidad?: string;
  consultorioId?: number;
  consultorioNombre?: string;
  consultorioCodigo?: string;
  fecha: string;
  hora: string;
  estado?: 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';
  motivo?: string;
  observaciones?: string;
  fechaCreacion?: string;
  motivoCancelacion?: string;
}
