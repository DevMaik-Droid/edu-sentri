export type Componente = {
  id?: string
  nombre: string
  descripcion?: string
}

export type Disciplina = {
  id?: string
  componente_id?: string
  nombre?: string
  descripcion?: string
}


export interface Profile {
  id?: string
  nombre: string | null
}
