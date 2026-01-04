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
  const [retryConfig, setRetryConfig] = useState<{
    tipo: string;
    area?: string | null;
  }>({ tipo: "general" });

  useEffect(() => {
    // Obtener datos desde localStorage temporal
    const preguntasStr = localStorage.getItem("temp_preguntas");
    const respuestasStr = localStorage.getItem("temp_respuestas");
    const tipoPrueba = localStorage.getItem("temp_tipo") || "general";
    const areaPrueba = localStorage.getItem("temp_area") || undefined;

    setRetryConfig({ tipo: tipoPrueba, area: areaPrueba || null });

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

  const getFeedback = (porcentaje: number) => {
    if (porcentaje >= 80) {
      return {
        title: "¡Impresionante!",
        message:
          "Has demostrado un dominio excepcional del contenido. ¡Sigue así, experto!",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        icon: Sparkles,
      };
    } else if (porcentaje >= 60) {
      return {
        title: "¡Buen Trabajo!",
        message:
          "Vas por buen camino, pero aún hay margen de mejora. ¡Tú puedes!",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-200 dark:border-green-800",
        icon: CheckCircle2,
      };
    } else {
      return {
        title: "¡No te rindas!",
        message:
          "El aprendizaje es un proceso. Revisa tus errores y vuelve a intentarlo.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-200 dark:border-orange-800",
        icon: TrendingUp,
      };
    }
  };

  const feedback = resultado ? getFeedback(resultado.porcentaje) : null;
  const FeedbackIcon = feedback?.icon || Home;

  // Circular Progress Component
  const CircularProgress = ({
    value,
    size = 180,
    strokeWidth = 15,
    colorClass = "text-primary",
  }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    colorClass?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-muted/20"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-500 delay-300">
          <span className={`text-4xl sm:text-5xl font-bold ${colorClass}`}>
            {Math.round(value)}%
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
            Puntuación
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 relative overflow-hidden">
      {/* Confetti container (existing logic) */}
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
        <div className="flex flex-col items-center justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Main Score Card */}
          <Card
            className={`w-full max-w-2xl border-2 shadow-xl ${feedback?.borderColor} bg-card/50 backdrop-blur-sm overflow-hidden`}
          >
            <div
              className={`h-2 w-full ${feedback?.bgColor.replace("/10", "")}`}
            />
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6">
              <div
                className={`p-4 rounded-full ${feedback?.bgColor} mb-2 animate-bounce`}
              >
                <FeedbackIcon className={`w-12 h-12 ${feedback?.color}`} />
              </div>

              <div className="space-y-2">
                <h1
                  className={`text-3xl sm:text-4xl font-bold ${feedback?.color}`}
                >
                  {feedback?.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance leading-relaxed">
                  {feedback?.message}
                </p>
              </div>

              <div className="py-2">
                <CircularProgress
                  value={resultado.porcentaje}
                  colorClass={feedback?.color || "text-primary"}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-4">
                <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  <span className="text-2xl font-bold text-green-600">
                    {resultado.correctas}
                  </span>
                  <span className="text-xs font-medium text-green-700/70 dark:text-green-400">
                    Correctas
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <span className="text-2xl font-bold text-red-600">
                    {resultado.incorrectas}
                  </span>
                  <span className="text-xs font-medium text-red-700/70 dark:text-red-400">
                    Incorrectas
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800">
                  <span className="text-2xl font-bold text-foreground">
                    {resultado.totalPreguntas}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas Breakdown */}
        <Card className="mb-8 border shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Desglose por Área
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {resultado.porArea.map((area, index) => (
                <div key={area.area} className="space-y-2">
                  <div className="flex justify-between items-end gap-4">
                    <span className="font-medium text-sm sm:text-base">
                      {area.area}
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          area.porcentaje >= 80
                            ? "text-green-600"
                            : area.porcentaje >= 60
                            ? "text-yellow-600"
                            : "text-orange-600"
                        }`}
                      >
                        {area.porcentaje.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({area.correctas}/{area.total})
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={area.porcentaje}
                    className="h-2.5 bg-muted"
                    // Colorize progress bar based on score using inline style or utility override if allowed by component props
                    // Shadcn Progress usually uses bg-primary for indicator.
                    // To customize color per bar, we might need a custom class or style on the indicator if accessible,
                    // or just wrap it.
                    // Assuming default Progress, it's primary color.
                    // We can try to use indicatorClassName if available, or just standard.
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Actions */}
        <div className="flex flex-col mb-8 sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full sm:w-auto gap-2 hover:bg-muted"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/prueba?tipo=${retryConfig.tipo}${
                  retryConfig.area
                    ? `&area=${encodeURIComponent(retryConfig.area)}`
                    : ""
                }`
              )
            }
            size="lg"
            className="w-full sm:w-auto gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva Prueba
          </Button>
        </div>

        {/* Detailed Question Analysis */}
        <Card className="mb-8 border shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Revisión de Preguntas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {(() => {
                // Recover questions and answers logic locally since we need it for rendering
                const preguntasStr = localStorage.getItem("temp_preguntas");
                const respuestasStr = localStorage.getItem("temp_respuestas");

                if (!preguntasStr || !respuestasStr) return null;

                const preguntas: PreguntaUI[] = JSON.parse(preguntasStr);
                const respuestas: RespuestaUsuario[] =
                  JSON.parse(respuestasStr);

                return preguntas.map((pregunta, index) => {
                  const respuestaUsuario = respuestas.find(
                    (r) => r.preguntaId === pregunta.id
                  );
                  const opcionCorrecta = pregunta.opciones.find(
                    (o) => o.es_correcta
                  );
                  const opcionUsuario = pregunta.opciones.find(
                    (o) => o.clave === respuestaUsuario?.respuestaSeleccionada
                  );
                  const esCorrecta = opcionUsuario?.es_correcta || false;

                  return (
                    <div
                      key={pregunta.id}
                      className="border rounded-lg p-4 space-y-3 bg-card/50"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {esCorrecta ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base mb-2">
                            {index + 1}. {pregunta.enunciado}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3">
                            <div
                              className={`p-3 rounded-md ${
                                esCorrecta
                                  ? "bg-green-500/10 border border-green-200 dark:border-green-900"
                                  : "bg-red-500/10 border border-red-200 dark:border-red-900"
                              }`}
                            >
                              <p className="font-medium mb-1 text-xs uppercase tracking-wide opacity-70">
                                Tu Respuesta
                              </p>
                              <p
                                className={
                                  esCorrecta
                                    ? "text-green-700 dark:text-green-300"
                                    : "text-red-700 dark:text-red-300"
                                }
                              >
                                {opcionUsuario
                                  ? `${opcionUsuario.clave}) ${opcionUsuario.texto}`
                                  : "No respondida"}
                              </p>
                            </div>

                            {!esCorrecta && (
                              <div className="p-3 rounded-md bg-green-500/10 border border-green-200 dark:border-green-900">
                                <p className="font-medium mb-1 text-xs uppercase tracking-wide opacity-70">
                                  Respuesta Correcta
                                </p>
                                <p className="text-green-700 dark:text-green-300">
                                  {opcionCorrecta
                                    ? `${opcionCorrecta.clave}) ${opcionCorrecta.texto}`
                                    : "No disponible"}
                                </p>
                              </div>
                            )}
                          </div>

                          {pregunta.sustento && (
                            <div className="mt-3 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                              <span className="font-semibold">
                                Explicación:{" "}
                              </span>
                              {pregunta.sustento}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
