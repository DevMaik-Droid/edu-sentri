import { supabase } from "@/lib/supabase/client";

import type { Pregunta, PreguntaUI } from "@/types/pregunta";
import { mapPreguntaDBtoUI } from "./preguta.mapper";

export async function obtenerPreguntas(limit = 10) : Promise<PreguntaUI[]> {
  const { data, error } = await supabase
    .from("preguntas")
    .select(
      `
      id,
     enunciado,
     opciones, 
     sustento,
     dificultad,
     activa,
     componentes(nombre),
     disciplinas(nombre),
     num_pregunta
    `
    )
    .eq("activa", true)
    .limit(limit);

  if (error) throw error
  if (!data) return []
    // 👇 Supabase puede devolver null
  return (data as Pregunta[]).map(mapPreguntaDBtoUI)
}

export async function obtenerPreguntasPorArea(area: string, limit = 10) : Promise<PreguntaUI[]> {
  const { data, error } = await supabase
    .from("preguntas")
    .select(
      `
      id,
     enunciado,
     opciones,
     sustento,
     dificultad,
     activa,
     componentes(nombre),
     disciplinas(nombre),
     num_pregunta
    `
    )
    .eq("activa", true)
    .eq("componentes.nombre", area)
    .order("num_pregunta", { ascending: true })
    .limit(limit);

  if (error) throw error
  if (!data) return []
    // 👇 Supabase puede devolver null
  return (data as Pregunta[]).map(mapPreguntaDBtoUI)
}