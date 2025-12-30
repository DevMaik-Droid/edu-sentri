// services/preguntas.mapper.ts
import { Pregunta, PreguntaUI } from "@/types/pregunta"


export function mapPreguntaDBtoUI(p: Pregunta): PreguntaUI {
  return {
    ...p,
    componentes: p.componentes?.[0] ?? null,
    disciplinas: p.disciplinas?.[0] ?? null,
  }
}
