import React from 'react'

const RecordarPage = () => {
  return (
    <div>RecordarPage: En Desarrollo</div>
  )
}

export default RecordarPage


// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Eye, CheckCircle, XCircle, RotateCw } from "lucide-react"
// import { Progress } from "@/components/ui/progress"
// import type { Pregunta } from "@/types/pregunta"
// import { guardarPreguntaIncorrecta } from "@/lib/errores"
// import ClientLayout from "../../ClientLayout"

// export default function RecordarPage() {
//   const [preguntasSession, setPreguntasSession] = useState<Pregunta[]>([])
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [mostrarRespuesta, setMostrarRespuesta] = useState(false)
//   const [resultado, setResultado] = useState<"correcta" | "incorrecta" | null>(null)
//   const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0 })

//   useEffect(() => {
//     const preguntasAleatorias = [...preguntas].sort(() => Math.random() - 0.5).slice(0, 20)
//     setPreguntasSession(preguntasAleatorias)
//   }, [])

//   if (preguntasSession.length === 0) {
//     return <div className="container mx-auto px-4 py-8">Cargando...</div>
//   }

//   const preguntaActual = preguntasSession[currentIndex]
//   const progreso = ((currentIndex + 1) / preguntasSession.length) * 100

//   const handleMostrarRespuesta = () => {
//     setMostrarRespuesta(true)
//   }

//   const handleResultado = (esCorrecta: boolean) => {
//     setResultado(esCorrecta ? "correcta" : "incorrecta")
//     setEstadisticas((prev) => ({
//       correctas: esCorrecta ? prev.correctas + 1 : prev.correctas,
//       incorrectas: esCorrecta ? prev.incorrectas : prev.incorrectas + 1,
//     }))

//     // Guardar error si es incorrecto
//     if (!esCorrecta) {
//       guardarPreguntaIncorrecta(preguntaActual)
//     }
//   }

//   const handleSiguiente = () => {
//     if (currentIndex < preguntasSession.length - 1) {
//       setCurrentIndex(currentIndex + 1)
//       setMostrarRespuesta(false)
//       setResultado(null)
//     }
//   }

//   const handleReiniciar = () => {
//     const preguntasAleatorias = [...preguntas].sort(() => Math.random() - 0.5).slice(0, 20)
//     setPreguntasSession(preguntasAleatorias)
//     setCurrentIndex(0)
//     setMostrarRespuesta(false)
//     setResultado(null)
//     setEstadisticas({ correctas: 0, incorrectas: 0 })
//   }

//   const finalizado = currentIndex === preguntasSession.length - 1 && resultado !== null

//   return (
//     <ClientLayout>
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h1 className="text-4xl font-bold mb-2">Recordar (Active Recall)</h1>
//             <p className="text-muted-foreground">Intenta responder antes de ver las opciones</p>
//           </div>
//           <Button variant="outline" onClick={handleReiniciar} className="gap-2 bg-transparent">
//             <RotateCw className="w-4 h-4" />
//             Reiniciar
//           </Button>
//         </div>

//         <div className="flex items-center gap-4 mb-2">
//           <Badge variant="outline" className="gap-1">
//             <CheckCircle className="w-3 h-3 text-green-600" />
//             {estadisticas.correctas} correctas
//           </Badge>
//           <Badge variant="outline" className="gap-1">
//             <XCircle className="w-3 h-3 text-red-600" />
//             {estadisticas.incorrectas} incorrectas
//           </Badge>
//           <span className="text-sm text-muted-foreground ml-auto">
//             {currentIndex + 1} de {preguntasSession.length}
//           </span>
//         </div>
//         <Progress value={progreso} className="h-2" />
//       </div>

//       <Card>
//         <CardHeader>
//           <Badge className="w-fit mb-2">{preguntaActual.area}</Badge>
//           <CardTitle className="text-xl leading-relaxed">{preguntaActual.pregunta}</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!mostrarRespuesta ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground mb-6">Piensa en la respuesta antes de revelarla</p>
//               <Button onClick={handleMostrarRespuesta} size="lg" className="gap-2">
//                 <Eye className="w-4 h-4" />
//                 Ver Respuesta
//               </Button>
//             </div>
//           ) : (
//             <>
//               <div className="space-y-3">
//                 {preguntaActual.opciones.map((opcion, idx) => {
//                   const esCorrecta = opcion === preguntaActual.respuestaCorrecta
//                   return (
//                     <div
//                       key={idx}
//                       className={`p-4 rounded-lg border-2 ${
//                         esCorrecta ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border bg-muted/30"
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         {esCorrecta && <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
//                         <span className={esCorrecta ? "font-medium" : ""}>{opcion}</span>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>

//               {preguntaActual.explicacion && (
//                 <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
//                   <p className="text-sm font-medium mb-1">Explicación:</p>
//                   <p className="text-sm text-muted-foreground">{preguntaActual.explicacion}</p>
//                 </div>
//               )}

//               {resultado === null ? (
//                 <div className="flex gap-3 pt-4">
//                   <Button
//                     onClick={() => handleResultado(false)}
//                     variant="outline"
//                     className="flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
//                   >
//                     <XCircle className="w-4 h-4" />
//                     Me equivoqué
//                   </Button>
//                   <Button
//                     onClick={() => handleResultado(true)}
//                     className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
//                   >
//                     <CheckCircle className="w-4 h-4" />
//                     Acerté
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-3 pt-4">
//                   <div
//                     className={`p-3 rounded-lg text-center ${
//                       resultado === "correcta"
//                         ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
//                         : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
//                     }`}
//                   >
//                     {resultado === "correcta" ? "¡Excelente! Sigue así" : "No te preocupes, repasaremos esto"}
//                   </div>

//                   {!finalizado && (
//                     <Button onClick={handleSiguiente} size="lg" className="w-full">
//                       Siguiente Pregunta
//                     </Button>
//                   )}

//                   {finalizado && (
//                     <div className="space-y-3">
//                       <div className="text-center p-6 bg-muted rounded-lg">
//                         <p className="text-2xl font-bold mb-2">
//                           {Math.round((estadisticas.correctas / preguntasSession.length) * 100)}% de aciertos
//                         </p>
//                         <p className="text-muted-foreground">
//                           {estadisticas.correctas} correctas de {preguntasSession.length}
//                         </p>
//                       </div>
//                       <Button onClick={handleReiniciar} size="lg" className="w-full gap-2">
//                         <RotateCw className="w-4 h-4" />
//                         Nueva Sesión
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//     </ClientLayout>
//   )
// }
