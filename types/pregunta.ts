import { Componente, Disciplina } from "./database"

export type Area =
  | "Comprensión Lectora"
  | "Razonamiento Lógico"
  | "Conocimientos Generales"
  | "Habilidades Socioemocionales"

export interface Pregunta {
  id: string
  enunciado: string
  opciones: {
    clave: string
    texto: string
    es_correcta: boolean
  }[]
  sustento: string
  dificultad?: 'fácil' | 'media' | 'difícil'
  activa?: boolean
  componentes?: Componente[]
  disciplinas?: Disciplina[]
  num_pregunta?: number
}

// types/pregunta.ui.ts
export interface PreguntaUI {
  id: string
  enunciado: string
  opciones: {
    clave: string
    texto: string
    es_correcta: boolean
  }[]
  sustento: string
  dificultad?: 'fácil' | 'media' | 'difícil'
  activa?: boolean
  componentes?: Componente | null
  disciplinas?: Disciplina | null
  num_pregunta?: number
}


export interface RespuestaUsuario {
  preguntaId: string
  respuestaSeleccionada: string
}

export interface Resultado {
  totalPreguntas: number
  correctas: number
  incorrectas: number
  porcentaje: number
  porArea: {
    area: string
    correctas: number
    total: number
    porcentaje: number
  }[]
}

export interface IntentoHistorico {
  id: string
  fecha: Date
  tipo: string
  area?: string
  totalPreguntas: number
  correctas: number
  incorrectas: number
  porcentaje: number
  porArea: {
    area: string
    correctas: number
    total: number
    porcentaje: number
  }[]
}
