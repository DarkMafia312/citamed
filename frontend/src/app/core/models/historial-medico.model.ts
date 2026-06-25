export interface HistorialMedico {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  medicoId: number;
  medicoNombre?: string;
  citaId?: number;
  descripcion: string;
  fecha?: string;
  diagnostico?: string;
  tratamiento?: string;
  medicamentos?: string;
  observaciones?: string;
  proximaCita?: string;
}
