import { Pregunta, PreguntaUI } from "@/types/pregunta";

export function mapPreguntaDBtoUI(p: Pregunta): PreguntaUI {
  return {
    ...p,
    // Si es array, toma el primero; si es objeto, usa tal cual; si es undefined, null
    componentes: Array.isArray(p.componentes) ? p.componentes[0] ?? null : p.componentes ?? null,
    disciplinas: Array.isArray(p.disciplinas) ? p.disciplinas[0] ?? null : p.disciplinas ?? null,
  }
}
