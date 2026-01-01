import { supabase } from "@/lib/supabase/client";
import type {
  TextoLectura,
  TextoLecturaConPreguntas,
} from "@/types/textos-lectura";

/**
 * Obtiene todos los textos de lectura disponibles con el conteo de preguntas asociadas
 */
export async function obtenerTextosLectura(): Promise<
  TextoLecturaConPreguntas[]
> {
  const { data: textos, error: textosError } = await supabase
    .from("textos_lectura")
    .select("id, titulo, contenido, fuente, componente_id")
    .order("titulo", { ascending: true });

  if (textosError) throw textosError;
  if (!textos) return [];

  // Para cada texto, contar sus preguntas
  const textosConPreguntas = await Promise.all(
    textos.map(async (texto) => {
      const { count, error: countError } = await supabase
        .from("preguntas")
        .select("id", { count: "exact", head: true })
        .eq("texto_lectura_id", texto.id)
        .eq("activa", true);

      if (countError) {
        console.error(
          `Error contando preguntas para texto ${texto.id}:`,
          countError
        );
        return { ...texto, num_preguntas: 0 };
      }

      return { ...texto, num_preguntas: count || 0 };
    })
  );

  // Filtrar textos que tienen al menos una pregunta
  return textosConPreguntas.filter((texto) => texto.num_preguntas > 0);
}

/**
 * Obtiene un texto de lectura específico por su ID
 */
export async function obtenerTextoLecturaPorId(
  id: string
): Promise<TextoLectura | null> {
  const { data, error } = await supabase
    .from("textos_lectura")
    .select("id, titulo, contenido, fuente, componente_id")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error obteniendo texto de lectura:", error);
    return null;
  }

  return data;
}
