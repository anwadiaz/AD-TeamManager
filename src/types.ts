export type Demarcacion = 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';
export type Lateralidad = 'Diestro' | 'Zurdo' | 'Ambidiestro';

export interface Player {
  id: string;
  nombre: string;
  apellidos: string;
  apodo?: string;
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
  partidos_jugados: number;
  titularidades: number;
  talla?: number;
}

export interface Position {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Formation {
  id: string;
  nombre: string;
  configuracion: Position[];
  user_id?: string;
  created_at?: string;
}

export interface Match {
  id: string;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  rival?: string;
  resultado_local: number;
  resultado_visitante: number;
  created_at: string;
  alineacion?: Record<string, string>;
  formacion?: string;
  informe_rival?: {
    offensive: string;
    defensive: string;
    transitions: string;
    youtube_url: string;
  };
  plan_partido?: {
    slides_url: string;
    youtube_url: string;
  };
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
  apodo?: string;
  dorsal?: number | string;
  fecha_nacimiento: string;
  demarcacion: Demarcacion;
  lateralidad: Lateralidad;
  equipo: string;
  talla?: number;
  partidos_jugados: number;
  titularidades: number;
}
