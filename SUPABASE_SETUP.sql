/*
  SQL para crear la tabla de jugadores en Supabase.
  Copia y pega esto en el SQL Editor de tu Dashboard de Supabase.
*/

-- 1. Actualizar la tabla jugadores con columnas de estadísticas
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS goles INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS asistencias INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS tarjetas_amarillas INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS tarjetas_rojas INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS minutos_jugados INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS partidos_jugados INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS titularidades INTEGER DEFAULT 0;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS talla INTEGER;

-- 2. Crear la tabla partidos
CREATE TABLE IF NOT EXISTS partidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  equipo_local TEXT NOT NULL,
  equipo_visitante TEXT NOT NULL,
  rival TEXT,
  resultado_local INTEGER DEFAULT 0,
  resultado_visitante INTEGER DEFAULT 0,
  alineacion JSONB DEFAULT '{}',
  formacion TEXT DEFAULT '4-4-2',
  informe_rival JSONB DEFAULT '{"offensive": "", "defensive": "", "transitions": "", "youtube_url": ""}',
  plan_partido JSONB DEFAULT '{"slides_url": "", "youtube_url": ""}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear la tabla alineaciones (Relación Muchos a Muchos para convocatorias)
CREATE TABLE IF NOT EXISTS alineaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  es_titular BOOLEAN DEFAULT true,
  UNIQUE(partido_id, jugador_id)
);

-- 4. Crear la tabla formaciones
CREATE TABLE IF NOT EXISTS formaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  configuracion JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE formaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users on formations" ON formaciones
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Crear la tabla evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  nota INTEGER CHECK (nota >= 1 AND nota <= 10),
  comentario TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Habilitar RLS
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alineaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para partidos
CREATE POLICY "Enable all access for authenticated users on matches" ON partidos
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Políticas para alineaciones
CREATE POLICY "Enable all access for authenticated users on lineups" ON alineaciones
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Políticas para evaluaciones
CREATE POLICY "Enable all access for authenticated users on evaluations" ON evaluaciones
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Crear la tabla equipos (match_teams)
CREATE TABLE IF NOT EXISTS match_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  type TEXT DEFAULT 'local',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE match_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users on match_teams" ON match_teams
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Crear bucket de Storage (Ejecutar en la sección de Storage o usar SQL si tienes permisos)
-- Nota: Es mejor crear el bucket "jugadores" manualmente desde el UI de Supabase Storage.
-- Asegúrate de que el bucket sea público para poder ver las imágenes.
