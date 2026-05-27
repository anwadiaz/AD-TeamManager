import { supabase } from './supabase';
import type { PlayerFormData } from '../types';

export const squadData: PlayerFormData[] = [
  { nombre: 'Carlos', apellidos: 'Vargas de los Reyes', apodo: 'Carlos Vargas', demarcacion: 'Portero', partidos_jugados: 23, titularidades: 16, goles: 0, tarjetas_amarillas: 2, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2003-01-01' },
  { nombre: 'Gonzalo Luis', apellidos: 'Gori Calle', apodo: 'Gonzalo Luis Gori', demarcacion: 'Portero', partidos_jugados: 22, titularidades: 12, goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2004-01-01' },
  { nombre: 'Javier', apellidos: 'Alcorta Román', apodo: 'Alcorta', demarcacion: 'Defensa', partidos_jugados: 27, titularidades: 26, goles: 2, tarjetas_amarillas: 1, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2001-01-01' },
  { nombre: 'Alejandro', apellidos: 'López Juan', apodo: 'Ale', demarcacion: 'Defensa', partidos_jugados: 17, titularidades: 7, goles: 0, tarjetas_amarillas: 5, tarjetas_rojas: 0, lateralidad: 'Zurdo', equipo: 'Atlético Central B', fecha_nacimiento: '2001-01-01' },
  { nombre: 'Alfonso', apellidos: 'Pumar López', apodo: 'Pumar', demarcacion: 'Defensa', partidos_jugados: 17, titularidades: 9, goles: 1, tarjetas_amarillas: 7, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Ricardo Juan', apellidos: 'Retamar Guerle', apodo: 'Ricardo', demarcacion: 'Defensa', partidos_jugados: 20, titularidades: 13, goles: 0, tarjetas_amarillas: 3, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Jose María', apellidos: 'Talegón Guerrero', apodo: 'Talegón', demarcacion: 'Defensa', partidos_jugados: 9, titularidades: 7, goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 1, lateralidad: 'Zurdo', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Javier', apellidos: 'Arroyo Rodrigo', apodo: 'Arroyo', demarcacion: 'Centrocampista', partidos_jugados: 18, titularidades: 8, goles: 2, tarjetas_amarillas: 2, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Enrique', apellidos: 'Calvo Medina', apodo: 'Kike', demarcacion: 'Centrocampista', partidos_jugados: 23, titularidades: 14, goles: 1, tarjetas_amarillas: 4, tarjetas_rojas: 1, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Juan Jose', apellidos: 'Pou Soto', apodo: 'Pou', demarcacion: 'Centrocampista', partidos_jugados: 19, titularidades: 12, goles: 1, tarjetas_amarillas: 3, tarjetas_rojas: 1, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Gonzalo', apellidos: 'Delgado Gómez', apodo: 'Tano', demarcacion: 'Centrocampista', partidos_jugados: 14, titularidades: 12, goles: 8, tarjetas_amarillas: 1, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2003-01-01' },
  { nombre: 'Jesús', apellidos: 'Alanís Hurtado', apodo: 'Alanís', demarcacion: 'Delantero', partidos_jugados: 4, titularidades: 1, goles: 1, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Gonzalo', apellidos: 'Campos Ponce', apodo: 'Gonzalo', demarcacion: 'Delantero', partidos_jugados: 22, titularidades: 17, goles: 6, tarjetas_amarillas: 1, tarjetas_rojas: 2, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Jaime', apellidos: 'Garcia Cordón', apodo: 'Jaime', demarcacion: 'Delantero', partidos_jugados: 2, titularidades: 0, goles: 2, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'José María', apellidos: 'Lima Rodriguez', apodo: 'Lima', demarcacion: 'Delantero', partidos_jugados: 20, titularidades: 6, goles: 1, tarjetas_amarillas: 4, tarjetas_rojas: 1, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2002-01-01' },
  { nombre: 'Luis', apellidos: 'Marín Lasa', apodo: 'Luis Marín', demarcacion: 'Delantero', partidos_jugados: 1, titularidades: 1, goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Juan', apellidos: 'Molina Ponce', apodo: 'Molina', demarcacion: 'Delantero', partidos_jugados: 1, titularidades: 1, goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Alberto', apellidos: 'Heredero Morillo', apodo: 'Alberto', demarcacion: 'Centrocampista', partidos_jugados: 24, titularidades: 18, goles: 6, tarjetas_amarillas: 4, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Babacar', apellidos: 'Ba Ba', apodo: 'Babacar Ba', demarcacion: 'Defensa', partidos_jugados: 27, titularidades: 20, goles: 0, tarjetas_amarillas: 4, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Carlos', apellidos: 'Piñero Quintana', apodo: 'Carlos Piñero', demarcacion: 'Centrocampista', partidos_jugados: 26, titularidades: 18, goles: 8, tarjetas_amarillas: 6, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Eduardo', apellidos: 'Valera Sanchez', apodo: 'Eduardo Valera', demarcacion: 'Delantero', partidos_jugados: 7, titularidades: 6, goles: 4, tarjetas_amarillas: 2, tarjetas_rojas: 1, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Fernando', apellidos: 'Rengel Mayoral', apodo: 'Fernando Rengel', demarcacion: 'Delantero', partidos_jugados: 7, titularidades: 3, goles: 1, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Jose Ramon', apellidos: 'Halcon Gonzalez', apodo: 'Jose Ramon Halcon', demarcacion: 'Centrocampista', partidos_jugados: 12, titularidades: 6, goles: 2, tarjetas_amarillas: 2, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Juan Cayetano', apellidos: 'de la Calle Yerga', apodo: 'Juan Cayetano', demarcacion: 'Defensa', partidos_jugados: 26, titularidades: 17, goles: 0, tarjetas_amarillas: 4, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Manuel Adolfo', apellidos: 'Cabezas Pedrayes', apodo: 'Manuel Adolfo', demarcacion: 'Centrocampista', partidos_jugados: 19, titularidades: 8, goles: 1, tarjetas_amarillas: 3, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Daniel', apellidos: 'del Toro', apodo: 'Martin', demarcacion: 'Centrocampista', partidos_jugados: 20, titularidades: 15, goles: 1, tarjetas_amarillas: 2, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Miguel Humberto', apellidos: 'Favela Haro', apodo: 'Miguel Humberto', demarcacion: 'Delantero', partidos_jugados: 15, titularidades: 5, goles: 2, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Miguel', apellidos: 'Martín Lago', apodo: 'Miguel Martín', demarcacion: 'Delantero', partidos_jugados: 1, titularidades: 0, goles: 1, tarjetas_amarillas: 0, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Pablo Martin', apellidos: 'Lopez', apodo: 'Pablo Martin', demarcacion: 'Delantero', partidos_jugados: 24, titularidades: 23, goles: 21, tarjetas_amarillas: 5, tarjetas_rojas: 1, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' },
  { nombre: 'Yahia', apellidos: 'Zekri Zekri', apodo: 'Yahia Zekri', demarcacion: 'Delantero', partidos_jugados: 6, titularidades: 1, goles: 2, tarjetas_amarillas: 1, tarjetas_rojas: 0, lateralidad: 'Diestro', equipo: 'Atlético Central B', fecha_nacimiento: '2000-01-01' }
];

export async function bulkImportPlayers() {
  const { error } = await supabase.from('jugadores').insert(squadData.map(p => ({
    ...p,
    dorsal: null // Let user assign dorsals later or we can try to guess
  })));
  
  if (error) {
    console.error('Error in bulk import:', error);
    throw error;
  }
}
