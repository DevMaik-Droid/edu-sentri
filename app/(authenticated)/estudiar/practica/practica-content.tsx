"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { QuestionCard } from "@/components/question-card"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import type { PreguntaUI } from "@/types/pregunta"
import { guardarPreguntaIncorrecta } from "@/lib/errores"
import { obtenerPreguntasPorArea } from "@/services/preguntas"

export default function PracticaAreaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const area = searchParams.get("area") || ""

  const [currentIndex, setCurrentIndex] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})
  const [finalizado, setFinalizado] = useState(false)
  
  const [preguntas, setPreguntas]=useState<PreguntaUI[]>([])


  useEffect( ()=>{
    
    const fetchPreguntas = async () => {
      const preguntas = await obtenerPreguntasPorArea(area)
      setPreguntas(preguntas)
    }

    fetchPreguntas()

  },[area])


  if (preguntas.length === 0) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>
  }

  const preguntaActual = preguntas[currentIndex]
  const progreso = ((currentIndex + 1) / preguntas.length) * 100

  const handleRespuesta = (respuesta: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [currentIndex]: respuesta,
    }))
  }

  const handleSiguiente = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setFinalizado(true)
    }
  }

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (finalizado) {
    const correctas = preguntas.filter((p, idx) => respuestas[idx] === p.opciones.find((o) => o.es_correcta)?.texto).length

    // Guardar preguntas incorrectas antes de mostrar resultados
    preguntas.forEach((p, idx) => {
      if (respuestas[idx] !== p.opciones.find((o) => o.es_correcta)?.texto) {
        guardarPreguntaIncorrecta(p)
      }
    })

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Práctica Completada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-5xl font-bold mb-2">{Math.round((correctas / preguntas.length) * 100)}%</p>
              <p className="text-muted-foreground">
                {correctas} de {preguntas.length} respuestas correctas
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => router.push("/estudiar")} variant="outline" className="flex-1">
                Volver a Estudiar
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Progreso</h2>
          <span className="text-sm text-muted-foreground">
            Pregunta {currentIndex + 1} de {preguntas.length}
          </span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>

      <div key={currentIndex} className="animate-in fade-in slide-in-from-right-4 duration-300">
        <QuestionCard
          numeroActual={currentIndex + 1}
          total={preguntas.length}
          pregunta={preguntaActual}
          respuestaSeleccionada={respuestas[currentIndex]}
          onRespuesta={handleRespuesta}
          mostrarCorrecta={!!respuestas[currentIndex]}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleAnterior}
          disabled={currentIndex === 0}
          className="gap-2 bg-card transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <Button
          onClick={handleSiguiente}
          disabled={!respuestas[currentIndex]}
          className="flex-1 gap-2 transition-all duration-200 hover:scale-105"
        >
          {currentIndex === preguntas.length - 1 ? "Finalizar" : "Siguiente"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
