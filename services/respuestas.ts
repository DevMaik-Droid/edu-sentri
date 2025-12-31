

import { supabase } from "@/lib/supabase/client";
import type { IntentoHistorico } from "@/types/pregunta";

export async function guardarIntentoSupabase(
  intento: Omit<IntentoHistorico, "id" | "fecha">
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  // 1️⃣ Guardar intento principal
  const { data: intentoInsertado, error } = await supabase
    .from("intentos_prueba")
    .insert({
      usuario_id: user.id,
      tipo: intento.tipo,
      area: intento.area ?? null,
      total_preguntas: intento.totalPreguntas,
      correctas: intento.correctas,
      incorrectas: intento.incorrectas,
      porcentaje: intento.porcentaje,
    })
    .select()
    .single()

  if (error) throw error

  // 2️⃣ Guardar resultados por área
  const porAreaRows = intento.porArea.map((a) => ({
    intento_id: intentoInsertado.id,
    area: a.area,
    correctas: a.correctas,
    total: a.total,
    porcentaje: a.porcentaje,
  }))

  const { error: errorArea } = await supabase
    .from("resultados_por_area")
    .insert(porAreaRows)

  if (errorArea) throw errorArea

  return intentoInsertado.id
}