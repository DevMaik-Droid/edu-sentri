"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PreguntaUI } from "@/types/pregunta";
import { obtenerPreguntasIA } from "@/services/ia";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, Bot } from "lucide-react";
import { LoadingLottie } from "@/components/loading-lottie";
import { Progress } from "@/components/ui/progress";

export default function IAPreguntasPage() {
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<PreguntaUI[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);

  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Estado simple para respuestas (solo para UX, no se guarda persistente complejo por ahora)
  const [respuestas, setRespuestas] = useState<
    { preguntaId: string; respuestaSeleccionada: string }[]
  >([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        // 1. Intentar cargar del caché local
        const savedQuestions = localStorage.getItem("edu-sentri-ia-questions");

        if (savedQuestions) {
          try {
            const parsed = JSON.parse(savedQuestions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPreguntas(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached questions", e);
            localStorage.removeItem("edu-sentri-ia-questions");
          }
        }

        // 2. Si no hay caché, cargar de Supabase
        const data = await obtenerPreguntasIA();
        setPreguntas(data);

        // 3. Guardar en caché
        if (data.length > 0) {
          localStorage.setItem("edu-sentri-ia-questions", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error cargando preguntas IA:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleSeleccionarRespuesta = (respuesta: string) => {
    const preguntaId = preguntas[preguntaActual].id;
    setRespuestas((prev) => {
      const filtered = prev.filter((r) => r.preguntaId !== preguntaId);
      return [...filtered, { preguntaId, respuestaSeleccionada: respuesta }];
    });
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1)
      setPreguntaActual(preguntaActual + 1);
  };

  const handleFinalizar = () => {
    setShowResults(true);
  };

  if (loading)
    return <LoadingLottie message="Cargando preguntas generadas por IA..." />;

  const respuestaActual = respuestas.find(
    (r) => r.preguntaId === preguntas[preguntaActual].id
  )?.respuestaSeleccionada;

  /*
   * Maneja la finalización de la prueba:
   * 1. Guarda los datos necesarios en localStorage para que la página de resultados los consuma.
   * 2. Redirige a /resultados.
   */
  if (showResults) {
    // Preparar datos para la página de resultados
    const preguntasParaResultados = preguntas;
    const respuestasParaResultados = respuestas;

    // Guardar en localStorage temporal (protocolo de comunicación con ResultadosPage)
    localStorage.setItem(
      "temp_preguntas",
      JSON.stringify(preguntasParaResultados)
    );
    localStorage.setItem(
      "temp_respuestas",
      JSON.stringify(respuestasParaResultados)
    );
    localStorage.setItem("temp_tipo", "ia");
    localStorage.setItem("temp_area", "Inteligencia Artificial"); // O algo genérico si no hay área específica

    // Redirigir
    router.push("/resultados");

    // Retornar null o loader mientras redirige
    return <LoadingLottie message="Calculando resultados..." />;
  }

  if (preguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Bot className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-xl font-bold">No hay preguntas generadas aún</h1>
        <p className="text-muted-foreground">
          Genera preguntas usando el Chat de IA primero.
        </p>
        <Button onClick={() => router.push("/chat-demo")}>Ir al Chat</Button>
      </div>
    );
  }

  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="container min-h-screen mx-auto px-4 py-4 sm:py-8 flex flex-col h-full">
        {/* HEADER */}
        <div className="mb-4 sm:mb-6 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Bot className="w-6 h-6" />
            <span>Preguntas por IA</span>
          </div>

          <div className="w-full">
            <Progress value={progreso} className="h-2" />
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>Pregunta {preguntaActual + 1}</span>
              <span>Total {preguntas.length}</span>
            </div>
          </div>
        </div>

        {/* CARD PREGUNTA */}
        <div className="flex-1 min-h-0 relative">
          <QuestionCard
            pregunta={preguntas[preguntaActual]}
            numeroActual={preguntaActual + 1}
            total={preguntas.length}
            respuestaSeleccionada={respuestaActual}
            onSeleccionarRespuesta={handleSeleccionarRespuesta}
            mostrarRespuesta={false} // Dejar que QuestionCard maneje feedback interno si está configurado, o true si queremos mostrar siempre
          />
        </div>

        {/* NAV BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleAnterior}
            disabled={preguntaActual === 0}
            className="gap-2 h-12"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>

          {preguntaActual === preguntas.length - 1 ? (
            <Button
              onClick={handleFinalizar}
              className="gap-2 h-12"
              variant="default"
              disabled={!respuestaActual}
            >
              <CheckCircle className="w-4 h-4" /> Finalizar
            </Button>
          ) : (
            <Button
              onClick={handleSiguiente}
              className="gap-2 h-12"
              disabled={!respuestaActual}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
