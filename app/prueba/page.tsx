"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RespuestaUsuario, Area, PreguntaUI } from "@/types/pregunta";
import {
  seleccionarPreguntasGenerales,
  seleccionarPreguntasDemo,
} from "@/lib/seleccionar-preguntas";
import { QuestionCard } from "@/components/question-card";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import {
  obtenerPreguntas,
  obtenerPreguntasGenerales,
  obtenerPreguntasPorArea,
} from "@/services/preguntas";
import { LoadingLottie } from "@/components/loading-lottie";

export default function PruebaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");
  const area = searchParams.get("area") as Area | null;

  const [preguntas, setPreguntas] = useState<PreguntaUI[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);

  useEffect(() => {
    const cargarPreguntas = async () => {
      let preguntasCargadas: PreguntaUI[] = await obtenerPreguntas();

      switch (tipo) {
        case "general":
          preguntasCargadas = await obtenerPreguntasGenerales();
          break;
        case "area":
          if (area) {
            preguntasCargadas = await obtenerPreguntasPorArea(area, 0, 99);
          } else {
            router.push("/");
            return;
          }
          break;
        case "demo":
          preguntasCargadas = await seleccionarPreguntasDemo();
          break;
        default:
          router.push("/");
          return;
      }

      setPreguntas(preguntasCargadas);
    };

    cargarPreguntas();
  }, [area, router, tipo]);

  const handleSeleccionarRespuesta = (respuesta: string) => {
    const preguntaId = preguntas[preguntaActual].id;
    const respuestasActualizadas = respuestas.filter(
      (r) => r.preguntaId !== preguntaId
    );
    respuestasActualizadas.push({
      preguntaId,
      respuestaSeleccionada: respuesta,
    });
    setRespuestas(respuestasActualizadas);
  };

  const handleAnterior = async () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const handleSiguiente = async () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const handleFinalizar = async () => {
    // Usar localStorage temporalmente para pasar datos a la página de resultados
    // Estos datos se limpiarán después de ser procesados
    localStorage.setItem("temp_preguntas", JSON.stringify(preguntas));
    localStorage.setItem("temp_respuestas", JSON.stringify(respuestas));
    localStorage.setItem("temp_tipo", tipo || "general");
    if (area) {
      localStorage.setItem("temp_area", area);
    }

    router.push("/resultados");
  };

  if (preguntas.length === 0) {
    return <LoadingLottie size={150} />;
  }

  const respuestaActual = respuestas.find(
    (r) => r.preguntaId === preguntas[preguntaActual].id
  )?.respuestaSeleccionada;
  const mostrarRespuesta = respuestaActual !== undefined;

  return (
    <div className="bg-background h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 sm:py-8 flex flex-col h-full">
        {/* 🔝 PROGRESO (FIJO ARRIBA) */}
        <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-1 duration-500 shrink-0">
          <ProgressBar actual={preguntaActual + 1} total={preguntas.length} />
        </div>

        {/* 🧠 CONTENEDOR DE LA PREGUNTA (SCROLL INTERNO) */}
        <div
          key={preguntaActual}
          className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300 min-h-0"
        >
          <QuestionCard
            pregunta={preguntas[preguntaActual]}
            numeroActual={preguntaActual + 1}
            total={preguntas.length}
            respuestaSeleccionada={respuestaActual}
            onSeleccionarRespuesta={handleSeleccionarRespuesta}
            mostrarRespuesta={mostrarRespuesta}
          />
        </div>

        {/* 🔽 BOTONES (SIEMPRE ABAJO) */}
        <div className="mt-4 grid grid-cols-3 gap-3 shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAnterior}
            disabled={preguntaActual === 0}
            className="gap-2 bg-card h-12 transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">Atrás</span>
          </Button>

          {preguntaActual === preguntas.length - 1 ? (
            <Button
              size="lg"
              onClick={handleFinalizar}
              disabled={respuestas.length !== preguntas.length}
              className="col-span-2 gap-2 h-12 transition-all duration-200 hover:scale-105"
            >
              <CheckCircle className="w-4 h-4" />
              Finalizar Prueba
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSiguiente}
              className="col-span-2 gap-2 h-12 transition-all duration-200 hover:scale-105"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="sm:hidden">Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* ℹ️ ESTADO */}
        <div className="mt-3 sm:mt-4 text-center shrink-0">
          {respuestas.length === preguntas.length ? (
            <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in duration-500">
              ✓ ¡Has respondido todas las preguntas! Puedes finalizar.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {respuestas.length} de {preguntas.length} respondidas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
