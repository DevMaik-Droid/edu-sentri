import { supabase } from "@/lib/supabase/client";

import type { Pregunta, PreguntaUI } from "@/types/pregunta";
import { mapPreguntaDBtoUI } from "./preguta.mapper";


export async function obtenerPreguntasGenerales(limit = 100): Promise<PreguntaUI[]> {
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

  if (error) throw error;
  if (!data) return [];
  // 👇 Supabase puede devolver null
  return (data as Pregunta[]).map(mapPreguntaDBtoUI);
}



export async function obtenerPreguntas(limit = 5): Promise<PreguntaUI[]> {
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

  if (error) throw error;
  if (!data) return [];
  // 👇 Supabase puede devolver null
  return (data as Pregunta[]).map(mapPreguntaDBtoUI);
}

export async function obtenerPreguntasPorArea(
  area: string,
  start: number,
  end: number
): Promise<PreguntaUI[]> {
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
     componentes!inner(nombre),
     disciplinas(nombre),
     num_pregunta
    `
    )
    .eq("activa", true)
    .eq("componentes.nombre", area)
    .order("num_pregunta", { ascending: true })
    .range(start, end);

  if (error) throw error;
  if (!data) return [];
  // 👇 Supabase puede devolver null
  return (data as Pregunta[]).map(mapPreguntaDBtoUI);
}

export async function obtenerConteoPreguntasPorArea(
  area: string
): Promise<number> {
  const { count, error } = await supabase
    .from("preguntas")
    .select("id, componentes!inner(nombre)", { count: "exact", head: true })
    .eq("activa", true)
    .eq("componentes.nombre", area);

  if (error) throw error;
  return count || 0;
}
