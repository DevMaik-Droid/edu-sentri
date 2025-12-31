"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  PreguntaUI,
  RespuestaUsuario,
  Resultado,
  Area,
} from "@/types/pregunta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Home,
  TrendingUp,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { guardarIntentoSupabase } from "@/services/intentos";
import { saveLocalHistory, addToReviewQueue } from "@/lib/local-storage";

export default function ResultadosPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Obtener datos desde localStorage temporal
    const preguntasStr = localStorage.getItem("temp_preguntas");
    const respuestasStr = localStorage.getItem("temp_respuestas");
    const tipoPrueba = localStorage.getItem("temp_tipo") || "general";
    const areaPrueba = localStorage.getItem("temp_area") || undefined;

    if (!preguntasStr || !respuestasStr) {
      router.push("/");
      return;
    }

    const preguntas: PreguntaUI[] = JSON.parse(preguntasStr);
    const respuestas: RespuestaUsuario[] = JSON.parse(respuestasStr);

    // Calcular resultados
    let correctas = 0;
    const porArea: { [key: string]: { correctas: number; total: number } } = {};

    preguntas.forEach((pregunta) => {
      const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id);
      const opcionCorrecta = pregunta.opciones.find((o) => o.es_correcta);
      const esCorrecta =
        respuesta?.respuestaSeleccionada === opcionCorrecta?.clave;

      if (esCorrecta) correctas++;

      // Guardar pregunta incorrecta para repaso (Local Storage)
      if (!esCorrecta) {
        addToReviewQueue(pregunta);
      }

      if (!porArea[pregunta.componentes?.nombre || "General"]) {
        porArea[pregunta.componentes?.nombre || "General"] = {
          correctas: 0,
          total: 0,
        };
      }
      porArea[pregunta.componentes?.nombre || "General"].total++;
      if (esCorrecta)
        porArea[pregunta.componentes?.nombre || "General"].correctas++;
    });

    const incorrectas = preguntas.length - correctas;
    const porcentaje = (correctas / preguntas.length) * 100;

    const resultadosPorArea = Object.entries(porArea).map(([area, stats]) => ({
      area: area as Area,
      correctas: stats.correctas,
      total: stats.total,
      porcentaje: (stats.correctas / stats.total) * 100,
    }));

    setResultado({
      totalPreguntas: preguntas.length,
      correctas,
      incorrectas,
      porcentaje,
      porArea: resultadosPorArea,
    });

    // Guardar intento en Supabase
    const guardarIntento = async () => {
      try {
        const result = await guardarIntentoSupabase({
          tipo: tipoPrueba,
          area: areaPrueba,
          totalPreguntas: preguntas.length,
          correctas,
          incorrectas,
          porcentaje,
          porArea: resultadosPorArea,
          preguntas,
          respuestas,
        });

        if (result.success && result.intentoId) {
          // Guardar en historial local para caché
          saveLocalHistory({
            id: result.intentoId,
            fecha: new Date(),
            tipo: tipoPrueba,
            area: areaPrueba,
            totalPreguntas: preguntas.length,
            correctas,
            incorrectas,
            porcentaje,
            porArea: resultadosPorArea,
          });
        }

        // Limpiar localStorage temporal después de guardar exitosamente
        localStorage.removeItem("temp_preguntas");
        localStorage.removeItem("temp_respuestas");
        localStorage.removeItem("temp_tipo");
        localStorage.removeItem("temp_area");
      } catch (error) {
        console.error("Error al guardar intento:", error);
      }
    };

    guardarIntento();

    if (porcentaje >= 70) {
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [router]);

  if (!resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-base sm:text-lg text-muted-foreground animate-pulse">
            Calculando resultados...
          </p>
        </div>
      </div>
    );
  }

  const esBuenPuntaje = resultado.porcentaje >= 70;
  const esExcelentePuntaje = resultado.porcentaje >= 90;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 py-6 sm:py-12 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 sm:w-10 sm:h-10 text-primary" />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 animate-in zoom-in duration-500 delay-200">
            {esExcelentePuntaje ? (
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
            ) : esBuenPuntaje ? (
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            ) : (
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-balance">
            {esExcelentePuntaje
              ? "¡Excelente Trabajo!"
              : esBuenPuntaje
              ? "¡Buen Trabajo!"
              : "Resultados de tu Prueba"}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            {esExcelentePuntaje
              ? "Has demostrado un dominio excepcional del contenido"
              : esBuenPuntaje
              ? "Has completado la prueba con buenos resultados"
              : "Sigue practicando para mejorar tus resultados"}
          </p>
        </div>

        <Card className="mb-6 sm:mb-8 border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center py-4 sm:py-6 relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg animate-pulse" />
                <p className="text-5xl sm:text-7xl font-bold mb-2 bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in zoom-in duration-500 delay-500 relative z-10">
                  {resultado.porcentaje.toFixed(1)}%
                </p>
                <p className="text-base sm:text-lg text-muted-foreground relative z-10">
                  Porcentaje de Aciertos
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <CardContent className="pt-4 sm:pt-6 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                      {resultado.totalPreguntas}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total de Preguntas
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <CardContent className="pt-4 sm:pt-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        {resultado.correctas}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Correctas
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 xs:col-span-1 col-span-1 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <CardContent className="pt-4 sm:pt-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">
                        {resultado.incorrectas}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Incorrectas
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 sm:mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Resultados por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {resultado.porArea.map((area, index) => (
                <div
                  key={area.area}
                  className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium text-sm sm:text-base truncate flex-1">
                      {area.area}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap font-semibold">
                      {area.correctas}/{area.total} (
                      {area.porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={area.porcentaje}
                    className="h-2 sm:h-3 transition-all duration-1000"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700">
          <Button
            onClick={() => router.push("/dashboard")}
            className="gap-2 sm:h-auto flex-1 transition-all duration-200 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/prueba?tipo=general")}
            className="gap-2 sm:h-auto flex-1 transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva Prueba
          </Button>
        </div>
      </div>
    </div>
  );
}
