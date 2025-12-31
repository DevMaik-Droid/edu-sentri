"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { PreguntaUI } from "@/types/pregunta";
import { useRouter } from "next/navigation";
import {
  getReviewQueue,
  clearReviewQueue,
  addToReviewQueue,
  removeFromReviewQueue,
} from "@/lib/local-storage";
import ClientLayout from "../../ClientLayout";

export default function ErroresPage() {
  const router = useRouter();
  const [preguntasErrores, setPreguntasErrores] = useState<PreguntaUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Guardamos la clave de la opción seleccionada
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [modoRepaso, setModoRepaso] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    const errores = getReviewQueue();
    setPreguntasErrores(errores);
  }, []);

  const handleLimpiarErrores = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres limpiar todas las preguntas guardadas?"
      )
    ) {
      clearReviewQueue();
      setPreguntasErrores([]);
    }
  };

  const handleIniciarRepaso = () => {
    setModoRepaso(true);
    setCurrentIndex(0);
    setRespuestas({});
    setFinalizado(false);
  };

  const handleRespuesta = (respuesta: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [currentIndex]: respuesta,
    }));
  };

  const handleSiguiente = () => {
    const preguntaActual = preguntasErrores[currentIndex];
    const respuestaUsuario = respuestas[currentIndex];
    const opcionCorrecta = preguntaActual.opciones.find((o) => o.es_correcta);

    // Lógica corrección
    const esCorrecta = respuestaUsuario === opcionCorrecta?.clave;

    if (esCorrecta) {
      // Si acierta, la quitamos de la lista de errores
      removeFromReviewQueue(preguntaActual.id);
    } else {
      // Si falla, nos aseguramos que siga ahí (o la movemos al final? por ahora persistimos)
      addToReviewQueue(preguntaActual);
    }

    if (currentIndex < preguntasErrores.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinalizado(true);
    }
  };

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (preguntasErrores.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              No hay preguntas para repasar
            </h2>
            <p className="text-muted-foreground mb-6">
              Las preguntas que respondas incorrectamente aparecerán aquí
            </p>
            <Button onClick={() => router.push("/estudiar/recordar")}>
              Ir a Recordar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (finalizado) {
    // Recalcular correctas en esta sesión
    const correctas = preguntasErrores.reduce((acc, p, idx) => {
      const resp = respuestas[idx];
      const optCorrecta = p.opciones.find((o) => o.es_correcta);
      return resp === optCorrecta?.clave ? acc + 1 : acc;
    }, 0);

    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Repaso Completado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold mb-2">
                  {Math.round((correctas / preguntasErrores.length) * 100)}%
                </p>
                <p className="text-muted-foreground">
                  {correctas} de {preguntasErrores.length} respuestas correctas
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setModoRepaso(false);
                    // Refresh list as some might be removed
                    setPreguntasErrores(getReviewQueue());
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Ver Lista Restante
                </Button>
                <Button
                  onClick={() => {
                    setPreguntasErrores(getReviewQueue());
                    handleIniciarRepaso();
                  }}
                  className="flex-1 gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Repetir Restantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  if (!modoRepaso) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold mb-2">Repaso de Errores</h1>
                <p className="text-muted-foreground">
                  Refuerza los temas donde tuviste dificultades
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLimpiarErrores}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold mb-1">
                    {preguntasErrores.length}
                  </p>
                  <p className="text-muted-foreground">
                    Preguntas guardadas para repasar
                  </p>
                </div>
                <Button
                  onClick={handleIniciarRepaso}
                  size="lg"
                  className="gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Iniciar Repaso
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {preguntasErrores.map((pregunta, idx) => (
              <Card key={pregunta.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Badge className="mb-2">
                        {pregunta.componentes?.nombre || "General"}
                      </Badge>
                      <p className="text-sm leading-relaxed">
                        {pregunta.enunciado}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </ClientLayout>
    );
  }

  const preguntaActual = preguntasErrores[currentIndex];
  const progreso = ((currentIndex + 1) / preguntasErrores.length) * 100;
  const respuestaSeleccionada = respuestas[currentIndex];
  // Simple UI inline instead of QuestionCard to avoid prop mismatch issues
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Repasando Errores</h2>
            <span className="text-sm text-muted-foreground">
              Pregunta {currentIndex + 1} de {preguntasErrores.length}
            </span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit mb-2">
              {preguntaActual.componentes?.nombre || "General"}
            </Badge>
            <CardTitle>{preguntaActual.enunciado}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {preguntaActual.opciones.map((opcion) => {
                const isSelected = respuestaSeleccionada === opcion.clave;
                const isCorrect = opcion.es_correcta;
                const showFeedback = !!respuestaSeleccionada;

                let variantClass =
                  "border-border hover:bg-accent hover:text-accent-foreground";
                if (showFeedback) {
                  if (isCorrect)
                    variantClass =
                      "border-green-500 bg-green-50 dark:bg-green-900/20";
                  else if (isSelected && !isCorrect)
                    variantClass =
                      "border-red-500 bg-red-50 dark:bg-red-900/20";
                  else variantClass = "opacity-50";
                } else if (isSelected) {
                  variantClass = "border-primary bg-primary/10";
                }

                return (
                  <div
                    key={opcion.clave}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${variantClass}`}
                    onClick={() =>
                      !respuestaSeleccionada && handleRespuesta(opcion.clave)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${
                                      showFeedback && isCorrect
                                        ? "border-green-500 text-green-500"
                                        : ""
                                    }
                                    ${
                                      showFeedback && isSelected && !isCorrect
                                        ? "border-red-500 text-red-500"
                                        : ""
                                    }
                                    ${
                                      !showFeedback && isSelected
                                        ? "border-primary text-primary"
                                        : "border-muted-foreground"
                                    }
                                 `}
                      >
                        {showFeedback && isCorrect && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4" />
                        )}
                        {!showFeedback && (
                          <span className="text-xs font-bold">
                            {opcion.clave}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{opcion.texto}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleAnterior}
            disabled={currentIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={handleSiguiente}
            disabled={!respuestas[currentIndex]}
            className="flex-1 gap-2"
          >
            {currentIndex === preguntasErrores.length - 1
              ? "Finalizar"
              : "Siguiente"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
