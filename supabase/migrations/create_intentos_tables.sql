-- Tabla para almacenar intentos de prueba
CREATE TABLE IF NOT EXISTS intentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'general', 'area', 'demo'
  area VARCHAR(100), -- área específica si tipo='area'
  total_preguntas INTEGER NOT NULL,
  correctas INTEGER NOT NULL,
  incorrectas INTEGER NOT NULL,
  porcentaje DECIMAL(5,2) NOT NULL,
  por_area JSONB NOT NULL, -- Array de resultados por área
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_intentos_user_id ON intentos(user_id);
CREATE INDEX IF NOT EXISTS idx_intentos_fecha ON intentos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_intentos_tipo ON intentos(tipo);

-- Tabla para almacenar respuestas individuales
CREATE TABLE IF NOT EXISTS respuestas_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intento_id UUID NOT NULL REFERENCES intentos(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL,
  respuesta_seleccionada VARCHAR(10) NOT NULL,
  es_correcta BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_respuestas_intento_id ON respuestas_usuario(intento_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta_id ON respuestas_usuario(pregunta_id);

-- Habilitar RLS
ALTER TABLE intentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para intentos
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios intentos" ON intentos;
CREATE POLICY "Los usuarios pueden ver sus propios intentos"
  ON intentos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios intentos" ON intentos;
CREATE POLICY "Los usuarios pueden crear sus propios intentos"
  ON intentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para respuestas_usuario
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias respuestas" ON respuestas_usuario;
CREATE POLICY "Los usuarios pueden ver sus propias respuestas"
  ON respuestas_usuario FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intentos
      WHERE intentos.id = respuestas_usuario.intento_id
      AND intentos.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias respuestas" ON respuestas_usuario;
CREATE POLICY "Los usuarios pueden crear sus propias respuestas"
  ON respuestas_usuario FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM intentos
      WHERE intentos.id = respuestas_usuario.intento_id
      AND intentos.user_id = auth.uid()
    )
  );
