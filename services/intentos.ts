import type {
  IntentoHistorico,
  RespuestaUsuario,
  PreguntaUI,
} from "@/types/pregunta";

import { supabase } from "@/lib/supabase/client";

export interface GuardarIntentoParams {
  tipo: string;
  area?: string;
  totalPreguntas: number;
  correctas: number;
  incorrectas: number;
  porcentaje: number;
  porArea: {
    area: string;
    correctas: number;
    total: number;
    porcentaje: number;
  }[];
  preguntas: PreguntaUI[];
  respuestas: RespuestaUsuario[];
}

/**
 * Guarda un intento de prueba en Supabase junto con sus respuestas
 */
export async function guardarIntentoSupabase(
  params: GuardarIntentoParams
): Promise<{ success: boolean; error?: string; intentoId?: string }> {
  try {
    // Verificar que el usuario esté autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // 1. Guardar el intento
    const { data: intento, error: intentoError } = await supabase
      .from("intentos")
      .insert({
        user_id: user.id,
        tipo: params.tipo,
        area: params.area || null,
        total_preguntas: params.totalPreguntas,
        correctas: params.correctas,
        incorrectas: params.incorrectas,
        porcentaje: params.porcentaje,
        por_area: params.porArea,
      })
      .select("id")
      .single();

    if (intentoError) {
      console.error("Error al guardar intento:", intentoError);
      return { success: false, error: intentoError.message };
    }

    // 2. Guardar las respuestas individuales
    const respuestasParaGuardar = params.respuestas.map((respuesta) => {
      const pregunta = params.preguntas.find(
        (p) => p.id === respuesta.preguntaId
      );
      const esCorrecta = pregunta
        ? respuesta.respuestaSeleccionada ===
          pregunta.opciones.find((o) => o.es_correcta)?.clave
        : false;

      return {
        intento_id: intento.id,
        pregunta_id: respuesta.preguntaId,
        respuesta_seleccionada: respuesta.respuestaSeleccionada,
        es_correcta: esCorrecta,
      };
    });

    const { error: respuestasError } = await supabase
      .from("respuestas_usuario")
      .insert(respuestasParaGuardar);

    if (respuestasError) {
      console.error("Error al guardar respuestas:", respuestasError);
      return { success: false, error: respuestasError.message };
    }

    return { success: true, intentoId: intento.id };
  } catch (error) {
    console.error("Error inesperado al guardar intento:", error);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Obtiene el historial de intentos del usuario autenticado
 */
export async function obtenerHistorialSupabase(): Promise<IntentoHistorico[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("intentos")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al obtener historial:", error);
      return [];
    }

    // Transformar datos de Supabase al formato IntentoHistorico
    return data.map((intento) => ({
      id: intento.id,
      fecha: new Date(intento.fecha),
      tipo: intento.tipo,
      area: intento.area || undefined,
      totalPreguntas: intento.total_preguntas,
      correctas: intento.correctas,
      incorrectas: intento.incorrectas,
      porcentaje: intento.porcentaje,
      porArea: intento.por_area,
    }));
  } catch (error) {
    console.error("Error inesperado al obtener historial:", error);
    return [];
  }
}

/**
 * Obtiene los detalles de un intento específico incluyendo sus respuestas
 */
export async function obtenerIntentoDetalle(intentoId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Obtener el intento
    const { data: intento, error: intentoError } = await supabase
      .from("intentos")
      .select("*")
      .eq("id", intentoId)
      .eq("user_id", user.id)
      .single();

    if (intentoError || !intento) {
      console.error("Error al obtener intento:", intentoError);
      return null;
    }

    // Obtener las respuestas
    const { data: respuestas, error: respuestasError } = await supabase
      .from("respuestas_usuario")
      .select("*")
      .eq("intento_id", intentoId);

    if (respuestasError) {
      console.error("Error al obtener respuestas:", respuestasError);
      return null;
    }

    return {
      intento: {
        id: intento.id,
        fecha: new Date(intento.fecha),
        tipo: intento.tipo,
        area: intento.area || undefined,
        totalPreguntas: intento.total_preguntas,
        correctas: intento.correctas,
        incorrectas: intento.incorrectas,
        porcentaje: intento.porcentaje,
        porArea: intento.por_area,
      },
      respuestas: respuestas.map((r) => ({
        id: r.id,
        preguntaId: r.pregunta_id,
        respuestaSeleccionada: r.respuesta_seleccionada,
        esCorrecta: r.es_correcta,
      })),
    };
  } catch (error) {
    console.error("Error inesperado al obtener detalle del intento:", error);
    return null;
  }
}

/**
 * Obtiene estadísticas de maestría por área (preguntas únicas respondidas correctamente)
 */
export async function obtenerEstadisticasMastery() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Obtener todas las respuestas del usuario
    const { data: respuestas, error: errorRespuestas } = await supabase
      .from("respuestas_usuario")
      .select("pregunta_id, es_correcta, intentos!inner(user_id)")
      .eq("intentos.user_id", user.id);

    if (errorRespuestas) {
      console.error(
        "Error al obtener respuestas para maestría:",
        errorRespuestas
      );
      return null;
    }

    if (!respuestas || respuestas.length === 0) return {};

    // 2. Obtener los IDs de preguntas únicos
    const preguntaIds = Array.from(
      new Set(respuestas.map((r) => r.pregunta_id))
    );

    // 3. Obtener info de las preguntas (áreas)
    // Supabase limita el número de items en 'in', así que si son muchos deberíamos paginar
    // Para simplificar, asumimos < 1000 preguntas únicas por ahora.
    const { data: preguntasInfo, error: errorPreguntas } = await supabase
      .from("preguntas")
      .select("id, componentes!inner(nombre)")
      .in("id", preguntaIds);

    if (errorPreguntas) {
      console.error("Error al obtener info de preguntas:", errorPreguntas);
      // Fallback: Si falla, no podemos clasificar por área, retornamos null o parcial?
      return null;
    }

    // Mapa de preguntaId -> areas[]
    interface PreguntaInfo {
      id: string;
      componentes: { nombre: string }[] | { nombre: string } | null;
    }

    const mapaPreguntasAreas = new Map<string, string[]>();
    (preguntasInfo as unknown as PreguntaInfo[])?.forEach((p) => {
      const componentesRaw = p.componentes;
      const componentes = Array.isArray(componentesRaw)
        ? componentesRaw
        : [componentesRaw].filter(Boolean);

      const areas = componentes.map((c) => c?.nombre).filter(Boolean);
      if (areas.length > 0) {
        mapaPreguntasAreas.set(p.id, areas as string[]);
      }
    });

    const statsPorArea: {
      [key: string]: { attempted: Set<string>; correct: Set<string> };
    } = {};

    // 4. Procesar respuestas con el mapa
    respuestas.forEach((row) => {
      const areas = mapaPreguntasAreas.get(row.pregunta_id);

      if (!areas) return;

      areas.forEach((area) => {
        if (!statsPorArea[area]) {
          statsPorArea[area] = {
            attempted: new Set(),
            correct: new Set(),
          };
        }

        statsPorArea[area].attempted.add(row.pregunta_id);
        if (row.es_correcta) {
          statsPorArea[area].correct.add(row.pregunta_id);
        }
      });
    });

    // Calcular porcentajes
    const resultados: { [key: string]: number } = {};
    Object.entries(statsPorArea).forEach(([area, sets]) => {
      const totalUnicas = sets.attempted.size;
      const totalCorrectasUnicas = sets.correct.size;
      resultados[area] =
        totalUnicas > 0 ? (totalCorrectasUnicas / totalUnicas) * 100 : 0;
    });

    return resultados;
  } catch (error) {
    console.error("Error inesperado en estadísticas mastery:", error);
    return null;
  }
}
