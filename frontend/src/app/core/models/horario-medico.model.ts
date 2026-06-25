export interface HorarioMedico {
  id?: number;
  medicoId: number;
  medicoNombre?: string;
  medicoEspecialidad?: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  disponible?: boolean;
}
