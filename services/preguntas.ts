import { supabase } from "@/lib/supabase/client";

import type { Pregunta } from "@/types/pregunta";
export async function obtenerPreguntas(limit = 100): Promise<Pregunta[]> {
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

  console.log(data);
  if (error) {
    console.error(error);
    throw new Error("Error al obtener preguntas");
  }
  return data;
}
