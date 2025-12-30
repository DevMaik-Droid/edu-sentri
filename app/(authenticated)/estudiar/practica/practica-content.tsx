"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { QuestionCard } from "@/components/question-card"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import type { PreguntaUI } from "@/types/pregunta"
import { obtenerPreguntasPorArea } from "@/services/preguntas"
import { LoadingLottie } from "@/components/loading-lottie"
import { supabase } from "@/lib/supabase/client"

export default function PracticaAreaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const area = searchParams.get("area") || ""

  const [preguntas, setPreguntas] = useState<PreguntaUI[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})
  const [finalizado, setFinalizado] = useState(false)
  const [guardado, setGuardado] = useState(false)

  /* ───────────────── FETCH ───────────────── */

  useEffect(() => {
    if (!area) {
      router.push("/estudiar")
      return
    }

    const fetchPreguntas = async () => {
      const data = await obtenerPreguntasPorArea(area)
      setPreguntas(data)
    }

    fetchPreguntas()
  }, [area, router])

  if (preguntas.length === 0) {
    return <LoadingLottie size={150} />
  }

  const preguntaActual = preguntas[currentIndex]
  const progreso = ((currentIndex + 1) / preguntas.length) * 100

  /* ───────────────── RESPUESTAS ───────────────── */

  const handleRespuesta = (respuesta: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [currentIndex]: respuesta,
    }))
  }

  const handleSiguiente = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex((p) => p + 1)
    } else {
      setFinalizado(true)
    }
  }

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1)
    }
  }

  /* ───────────────── RESULTADOS ───────────────── */

  const correctas = preguntas.reduce((acc, p, idx) => {
    const correcta = p.opciones.find(o => o.es_correcta)?.texto
    return respuestas[idx] === correcta ? acc + 1 : acc
  }, 0)

  const porcentaje = Math.round((correctas / preguntas.length) * 100)

  /* ───────────────── GUARDAR BD ───────────────── */

  // useEffect(() => {
  //   if (!finalizado || guardado) return

  //   const guardarResultados = async () => {
  //     const { data: userData } = await supabase.auth.getUser()
  //     const user = userData.user
  //     if (!user) return

  //     const { data: intento } = await supabase
  //       .from("intentos_prueba")
  //       .insert({
  //         user_id: user.id,
  //         area,
  //         total_preguntas: preguntas.length,
  //         correctas,
  //         porcentaje,
  //       })
  //       .select()
  //       .single()

  //     if (!intento) return

  //     await supabase.from("respuestas_usuario").insert(
  //       preguntas.map((p, idx) => {
  //         const correcta = p.opciones.find(o => o.es_correcta)?.texto
  //         const respuestaUsuario = respuestas[idx]
  //         return {
  //           intento_id: intento.id,
  //           pregunta_id: p.id,
  //           respuesta: respuestaUsuario,
  //           es_correcta: respuestaUsuario === correcta,
  //         }
  //       })
  //     )

  //     setGuardado(true)
  //   }

  //   guardarResultados()
  // }, [finalizado, guardado, preguntas, respuestas, area, correctas, porcentaje])

  /* ───────────────── VISTA FINAL ───────────────── */

  if (finalizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Práctica completada
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <p className="text-5xl font-bold">{porcentaje}%</p>
              <p className="text-muted-foreground mt-1">
                {correctas} de {preguntas.length} respuestas correctas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => router.push("/estudiar")}>
                Volver a estudiar
              </Button>
              <Button
                onClick={() => {
                  setRespuestas({})
                  setCurrentIndex(0)
                  setFinalizado(false)
                  setGuardado(false)
                }}
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ───────────────── VISTA EXAMEN ───────────────── */

  return (
    <div className="bg-background h-screen">
      <div className="container mx-auto px-4 py-2 sm:py-8 h-full flex flex-col">

        {/* PROGRESO */}
        <div className="mb-4 sm:mb-6 shrink-0">
          <Progress value={progreso} className="h-2" />
          <div className="flex justify-between mt-1 text-sm text-muted-foreground">
            <span>Pregunta {currentIndex + 1}</span>
            <span>Total {preguntas.length}</span>
          </div>
        </div>

        {/* PREGUNTA (SCROLL INTERNO) */}
        <div
          key={currentIndex}
          className="flex-1 min-h-0 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <QuestionCard
            numeroActual={currentIndex + 1}
            total={preguntas.length}
            pregunta={preguntaActual}
            respuestaSeleccionada={respuestas[currentIndex]}
            onRespuesta={handleRespuesta}
            mostrarCorrecta={!!respuestas[currentIndex]}
          />
        </div>

        {/* BOTONES (SIEMPRE ABAJO) */}
        <div className="grid grid-cols-3 gap-3 mt-4 shrink-0">
          <Button
            variant="outline"
            onClick={handleAnterior}
            disabled={currentIndex === 0}
            className="h-12 transition-all duration-200 hover:scale-102 gap-3 hover:bg-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </Button>

          <Button
            onClick={handleSiguiente}
            disabled={!respuestas[currentIndex]}
            className="col-span-2 transition-all duration-200 hover:scale-102 gap-3 h-12 hover:bg-primary"
          >
            {currentIndex === preguntas.length - 1
              ? "Finalizar"
              : "Siguiente"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* ESTADO */}
        <div className="mt-3 text-center text-sm text-muted-foreground shrink-0">
          {Object.keys(respuestas).length} de {preguntas.length} respondidas
        </div>
      </div>
    </div>
  )
}
