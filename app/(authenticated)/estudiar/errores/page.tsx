"use client"

import React from 'react'

const ErroresPage = () => {
  return (
    <div>Errores: En desarrollo</div>
  )
}

export default ErroresPage;



// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { QuestionCard } from "@/components/question-card"
// import { Progress } from "@/components/ui/progress"
// import { AlertCircle, RotateCw, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
// import type { Pregunta } from "@/types/pregunta"
// import { useRouter } from "next/navigation"
// import { obtenerPreguntasIncorrectas, limpiarPreguntasIncorrectas, guardarPreguntaIncorrecta } from "@/lib/errores"

// export default function ErroresPage() {
//   const router = useRouter()
//   const [preguntasErrores, setPreguntasErrores] = useState<Pregunta[]>([])
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [respuestas, setRespuestas] = useState<Record<number, string>>({})
//   const [modoRepaso, setModoRepaso] = useState(false)
//   const [finalizado, setFinalizado] = useState(false)

//   useEffect(() => {
//     const errores = obtenerPreguntasIncorrectas()
//     setPreguntasErrores(errores.slice(0, 20))
//   }, [])

//   const handleLimpiarErrores = () => {
//     if (confirm("¿Estás seguro de que quieres limpiar todas las preguntas guardadas?")) {
//       limpiarPreguntasIncorrectas()
//       setPreguntasErrores([])
//     }
//   }

//   const handleIniciarRepaso = () => {
//     setModoRepaso(true)
//     setCurrentIndex(0)
//     setRespuestas({})
//     setFinalizado(false)
//   }

//   const handleRespuesta = (respuesta: string) => {
//     setRespuestas((prev) => ({
//       ...prev,
//       [currentIndex]: respuesta,
//     }))
//   }

//   const handleSiguiente = () => {
//     const preguntaActual = preguntasErrores[currentIndex]
//     if (respuestas[currentIndex] !== preguntaActual.respuestaCorrecta) {
//       guardarPreguntaIncorrecta(preguntaActual)
//     }

//     if (currentIndex < preguntasErrores.length - 1) {
//       setCurrentIndex(currentIndex + 1)
//     } else {
//       setFinalizado(true)
//     }
//   }

//   const handleAnterior = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1)
//     }
//   }

//   if (preguntasErrores.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-2xl">
//         <Card>
//           <CardContent className="pt-6 text-center py-12">
//             <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//             <h2 className="text-2xl font-bold mb-2">No hay preguntas para repasar</h2>
//             <p className="text-muted-foreground mb-6">
//               Las preguntas que respondas incorrectamente en el modo "Recordar" aparecerán aquí
//             </p>
//             <Button onClick={() => router.push("/estudiar/recordar")}>Ir a Recordar</Button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (finalizado) {
//     const correctas = preguntasErrores.filter((p, idx) => respuestas[idx] === p.respuestaCorrecta).length

//     return (
//       <div className="container mx-auto px-4 py-8 max-w-2xl">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-center">Repaso Completado</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="text-center">
//               <p className="text-5xl font-bold mb-2">{Math.round((correctas / preguntasErrores.length) * 100)}%</p>
//               <p className="text-muted-foreground">
//                 {correctas} de {preguntasErrores.length} respuestas correctas
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <Button onClick={() => setModoRepaso(false)} variant="outline" className="flex-1">
//                 Ver Lista
//               </Button>
//               <Button onClick={handleIniciarRepaso} className="flex-1 gap-2">
//                 <RotateCw className="w-4 h-4" />
//                 Repetir
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (!modoRepaso) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <div>
//               <h1 className="text-4xl font-bold mb-2">Repaso de Errores</h1>
//               <p className="text-muted-foreground">Refuerza los temas donde tuviste dificultades</p>
//             </div>
//             <Button variant="destructive" onClick={handleLimpiarErrores} className="gap-2">
//               <Trash2 className="w-4 h-4" />
//               Limpiar
//             </Button>
//           </div>
//         </div>

//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-3xl font-bold mb-1">{preguntasErrores.length}</p>
//                 <p className="text-muted-foreground">Preguntas guardadas para repasar</p>
//               </div>
//               <Button onClick={handleIniciarRepaso} size="lg" className="gap-2">
//                 <RotateCw className="w-4 h-4" />
//                 Iniciar Repaso
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="space-y-3">
//           {preguntasErrores.map((pregunta, idx) => (
//             <Card key={pregunta.id}>
//               <CardHeader>
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1">
//                     <Badge className="mb-2">{pregunta.area}</Badge>
//                     <p className="text-sm leading-relaxed">{pregunta.pregunta}</p>
//                   </div>
//                   <span className="text-sm text-muted-foreground shrink-0">#{idx + 1}</span>
//                 </div>
//               </CardHeader>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   const preguntaActual = preguntasErrores[currentIndex]
//   const progreso = ((currentIndex + 1) / preguntasErrores.length) * 100

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-2xl font-bold">Repasando Errores</h2>
//           <span className="text-sm text-muted-foreground">
//             Pregunta {currentIndex + 1} de {preguntasErrores.length}
//           </span>
//         </div>
//         <Progress value={progreso} className="h-2" />
//       </div>

//       <QuestionCard
//         pregunta={preguntaActual}
//         respuestaSeleccionada={respuestas[currentIndex]}
//         onRespuesta={handleRespuesta}
//         mostrarCorrecta={!!respuestas[currentIndex]}
//       />

//       <div className="flex gap-3 mt-6">
//         <Button
//           variant="outline"
//           onClick={handleAnterior}
//           disabled={currentIndex === 0}
//           className="gap-2 bg-transparent"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Anterior
//         </Button>

//         <Button onClick={handleSiguiente} disabled={!respuestas[currentIndex]} className="flex-1 gap-2">
//           {currentIndex === preguntasErrores.length - 1 ? "Finalizar" : "Siguiente"}
//           <ChevronRight className="w-4 h-4" />
//         </Button>
//       </div>
//     </div>
//   )
// }
