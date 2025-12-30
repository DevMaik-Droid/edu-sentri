"use client"

import type { Pregunta } from "@/types/pregunta"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuestionCardProps {
  pregunta: Pregunta
  numeroActual?: number
  total?: number
  respuestaSeleccionada: string | undefined
  onRespuesta?: (respuesta: string) => void
  onSeleccionarRespuesta?: (respuesta: string) => void
  mostrarRespuesta?: boolean
  mostrarCorrecta?: boolean
}

export function QuestionCard({
  pregunta,
  numeroActual,
  total,
  respuestaSeleccionada,
  onRespuesta,
  onSeleccionarRespuesta,
  mostrarRespuesta = false,
  mostrarCorrecta = false,
}: QuestionCardProps) {



  const handleChange = (value: string) => {
    if (onRespuesta) onRespuesta(value)
    if (onSeleccionarRespuesta) onSeleccionarRespuesta(value)
  }

  const mostrar = mostrarRespuesta || mostrarCorrecta
  const esCorrecta = respuestaSeleccionada === pregunta.opciones.find(opcion => opcion.es_correcta)?.texto

  return (
    <Card
      className={`border-2 transition-all duration-300 ${mostrar && esCorrecta ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}`}
    >
      <CardHeader className="space-y-3 sm:space-y-4">
        {numeroActual && total && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Pregunta {numeroActual} de {total}
            </span>
            <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 bg-secondary rounded-full w-fit">
              {pregunta.componente?.nombre}
            </span>
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">{pregunta.num_pregunta}. {pregunta.enunciado}</h2>
      </CardHeader>
      <CardContent>
        <RadioGroup value={respuestaSeleccionada} onValueChange={handleChange} className="space-y-2 sm:space-y-3">
          {pregunta.opciones.map((opcion, index) => {

            const seleccion_correcta = respuestaSeleccionada === opcion.texto && opcion.es_correcta
            const seleccion_incorrecta = respuestaSeleccionada === opcion.texto && !opcion.es_correcta
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  seleccion_correcta
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : seleccion_incorrecta
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <RadioGroupItem value={opcion.texto} id={`opcion-${index}`} disabled={mostrar} className="shrink-0" />
                <Label
                  htmlFor={`opcion-${index}`}
                  className={`flex-1 cursor-pointer text-sm sm:text-base leading-relaxed ${
                    seleccion_correcta
                      ? "font-semibold text-green-700 dark:text-green-400"
                      : seleccion_incorrecta
                        ? "font-semibold text-red-700 dark:text-red-400"
                        : ""
                  }`}
                >
                  {opcion.texto}
                </Label>
                {seleccion_correcta && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />}
                {seleccion_incorrecta && (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                )}
              </div>
            )
          })}
        </RadioGroup>

        {mostrar && !esCorrecta && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-400">
              Respuesta correcta: <span className="font-bold">{pregunta.opciones.find(opcion => opcion.es_correcta)?.texto}</span>
            </p>
          </div>
        )}

        {mostrar && pregunta.sustento && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">Explicación:</p>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">{pregunta.sustento}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
