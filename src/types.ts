export type Demarcacion = 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';
export type Lateralidad = 'Diestro' | 'Zurdo' | 'Ambidiestro';

export interface Player {
  id: string;
  nombre: string;
  apellidos: string;
  dorsal: number;
  fecha_nacimiento: string;
  demarcacion: Demarcacion;
  lateralidad: Lateralidad;
  equipo: string;
  foto_jugador?: string;
  observaciones?: string;
  created_at: string;
  // Stats
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  minutos_jugados: number;
  talla?: number;
}

export interface Match {
  id: string;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  resultado_local: number;
  resultado_visitante: number;
  created_at: string;
}

export interface Evaluation {
  id: string;
  jugador_id: string;
  usuario_id: string;
  nota: number;
  comentario: string;
  fecha: string;
  created_at: string;
}

export interface Lineup {
  id: string;
  partido_id: string;
  jugador_id: string;
  es_titular: boolean;
}

export interface PlayerFormData extends Omit<Partial<Player>, 'id' | 'created_at' | 'dorsal'> {
  nombre: string;
  apellidos: string;
  dorsal: number | string;
  fecha_nacimiento: string;
  demarcacion: Demarcacion;
  lateralidad: Lateralidad;
  equipo: string;
  talla?: number;
}
