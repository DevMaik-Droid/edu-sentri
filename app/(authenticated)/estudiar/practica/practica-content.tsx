"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionCard } from "@/components/question-card";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Settings,
  Play,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PreguntaUI } from "@/types/pregunta";
import {
  obtenerPreguntasPorArea,
  obtenerConteoPreguntasPorArea,
  obtenerRangoPreguntas,
} from "@/services/preguntas";
import { LoadingLottie } from "@/components/loading-lottie";

const AREAS_CON_DISCIPLINAS: Record<string, string[]> = {
  "Razonamiento Lógico": [
    "Identificación de Patrones",
    "Razonamiento Lógico Matemático",
    "Problemas Matemático",
  ],
  "Conocimientos Generales": [
    "Física",
    "Matemática",
    "Química",
    "Geografía",
    "Psicologia",
    "Filosofia",
    "Historia",
    "Biología",
    "Técnica Tecnológica",
    "Lenguaje",
  ],
};

export default function PracticaAreaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const area = searchParams.get("area") || "";

  // Estados de configuración
  const [configurado, setConfigurado] = useState(false);
  const [rangoInicio, setRangoInicio] = useState(1);
  const [rangoFin, setRangoFin] = useState(20);
  const [totalDisponible, setTotalDisponible] = useState(0);
  const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>(
    () => {
      const currentArea = searchParams.get("area") || "";
      return AREAS_CON_DISCIPLINAS[currentArea]?.[0] || "todas";
    }
  );
  const [cargando, setCargando] = useState(false);
  const [cargandoTotal, setCargandoTotal] = useState(true);

  // Estados de la práctica
  const [preguntas, setPreguntas] = useState<PreguntaUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});

  // Validar área y cargar total
  useEffect(() => {
    if (!area) {
      router.push("/estudiar");
      return;
    }
  }, [area, router]);

  // Reset disciplina ONLY when area changes
  useEffect(() => {
    if (!area) return;

    if (AREAS_CON_DISCIPLINAS[area]) {
      setDisciplinaSeleccionada(AREAS_CON_DISCIPLINAS[area][0]);
    } else {
      setDisciplinaSeleccionada("todas");
    }
  }, [area]);

  // Fetch data when depedencies change
  useEffect(() => {
    if (!area) return;

    // Cargar total disponible
    const fetchTotal = async () => {
      try {
        const isRazonamientoLogico = area === "Razonamiento Lógico";
        const disciplina =
          disciplinaSeleccionada === "todas"
            ? undefined
            : disciplinaSeleccionada;

        if (isRazonamientoLogico && disciplina) {
          // Lógica especial para Razonamiento Lógico con disciplina: cargar rangos reales
          const rangos = await obtenerRangoPreguntas(area, disciplina);
          if (rangos) {
            setTotalDisponible(rangos.max - rangos.min + 1); // Aproximado
            setRangoInicio(rangos.min);
            // Máximo 100 preguntas por limitación de UI
            const sugeridoFin = Math.min(rangos.max, rangos.min + 99);
            setRangoFin(sugeridoFin);
          }
        } else {
          // Lógica standard y conocimientos generales
          const total = await obtenerConteoPreguntasPorArea(area, disciplina);
          setTotalDisponible(total);
          // Ajustar valores por defecto para standard
          if (total > 0) {
            setRangoFin(Math.min(total, 20)); // Default first 20 or total
          } else {
            setRangoInicio(1);
            setRangoFin(20);
          }
        }
      } catch (error) {
        console.error("Error al cargar total:", error);
      } finally {
        setCargandoTotal(false);
      }
    };
    fetchTotal();
  }, [area, disciplinaSeleccionada]);

  /* ───────────────── INICIO ───────────────── */

  const isRazonamientoLogico = area === "Razonamiento Lógico";
  const isConocimientosGenerales = area === "Conocimientos Generales";

  const handleIniciar = async () => {
    setCargando(true);
    try {
      let data: PreguntaUI[] = [];

      if (isConocimientosGenerales) {
        // Para conocimientos generales, traer todas (o un límite alto por defecto si es necesario, aquí usamos range sobre indices)
        // Se asume que el usuario quiere practicar todo lo de esa disciplina o area
        // Usamos totalDisponible como límite
        const total = totalDisponible > 0 ? totalDisponible : 200;
        data = await obtenerPreguntasPorArea(
          area,
          0,
          total - 1,
          disciplinaSeleccionada === "todas"
            ? undefined
            : disciplinaSeleccionada,
          false
        );
      } else if (isRazonamientoLogico) {
        // Para razonamiento lógico, usar num_pregunta explícito
        // No se resta 1, se usan los valores tal cual como IDs lógicos
        const disciplina =
          disciplinaSeleccionada === "todas"
            ? undefined
            : disciplinaSeleccionada;
        data = await obtenerPreguntasPorArea(
          area,
          rangoInicio,
          rangoFin,
          disciplina,
          true // usarNumPregunta
        );
      } else {
        // Comportamiento default (indices 0-based)
        const inicio = Math.max(1, rangoInicio);
        const fin = Math.min(
          rangoFin,
          totalDisponible > 0 ? totalDisponible : 200
        );
        const disciplina =
          disciplinaSeleccionada === "todas"
            ? undefined
            : disciplinaSeleccionada;
        data = await obtenerPreguntasPorArea(
          area,
          inicio - 1,
          fin - 1,
          disciplina,
          false
        );
      }

      if (data.length === 0) {
        console.error("No se encontraron preguntas en el rango");
      }

      setPreguntas(data);
      setConfigurado(true);
    } catch (error) {
      console.error("Error al cargar preguntas:", error);
    } finally {
      setCargando(false);
    }
  };

  /* ───────────────── RESPUESTAS ───────────────── */

  const handleRespuesta = (respuesta: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [currentIndex]: respuesta,
    }));
  };

  const handleSiguiente = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      handleFinalizar();
    }
  };

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  /* ───────────────── FINALIZAR ───────────────── */

  const handleFinalizar = () => {
    // Convertir respuestas al formato esperado
    // RespuestaUsuario[]: { preguntaId: string, respuestaSeleccionada: string }
    const respuestasArray = preguntas
      .map((p, index) => ({
        preguntaId: p.id,
        respuestaSeleccionada: respuestas[index] || "",
      }))
      .filter((r) => r.respuestaSeleccionada !== ""); // Filtrar no respondidas por si acaso

    // Guardar en localStorage temporal para la página de resultados
    localStorage.setItem("temp_preguntas", JSON.stringify(preguntas));
    localStorage.setItem("temp_respuestas", JSON.stringify(respuestasArray));
    localStorage.setItem("temp_tipo", "area"); // Tipo "area" para prácticas específicas
    localStorage.setItem("temp_area", area);

    router.push("/resultados");
  };

  /* ───────────────── RENDER: CONFIGURACIÓN ───────────────── */

  if (!configurado) {
    if (cargando || cargandoTotal) return <LoadingLottie size={150} />;

    const cantidadSeleccionada = Math.max(0, rangoFin - rangoInicio + 1);

    // Validación dinámica
    let esValido = false;
    let mensajeError = "";

    if (isConocimientosGenerales) {
      esValido = true; // No hay input de rango, siempre válido si total > 0 (o manejado en UI)
    } else if (isRazonamientoLogico) {
      // Validar rango size <= 100
      if (cantidadSeleccionada > 100) {
        esValido = false;
        mensajeError = "El rango no puede exceder 100 preguntas.";
      } else if (rangoInicio < 1 || rangoFin < rangoInicio) {
        esValido = false;
        mensajeError = "Rango inválido.";
      } else {
        esValido = true;
      }
    } else {
      // Default validation
      esValido =
        rangoInicio > 0 &&
        rangoFin >= rangoInicio &&
        rangoFin <= (totalDisponible || 200) &&
        cantidadSeleccionada <= 200;
      if (cantidadSeleccionada > 200) mensajeError = "Máximo 200 preguntas.";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Configurar Práctica
            </CardTitle>
            <CardDescription>
              {totalDisponible > 0
                ? `Hay ${totalDisponible} preguntas disponibles para ${area}${
                    disciplinaSeleccionada !== "todas"
                      ? ` (${disciplinaSeleccionada})`
                      : ""
                  }`
                : `Personaliza tu sesión de práctica para ${area}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {AREAS_CON_DISCIPLINAS[area] && (
              <div className="space-y-2">
                <Label>Filtrar por Disciplina</Label>
                <Select
                  value={disciplinaSeleccionada}
                  onValueChange={(value) => {
                    setDisciplinaSeleccionada(value);
                    // setRangoInicio will be handled by useEffect
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_CON_DISCIPLINAS[area].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Inputs de Rango - Ocultos para Conocimientos Generales */}
            {!isConocimientosGenerales ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inicio">
                      {isRazonamientoLogico
                        ? "Pregunta No. (Inicio)"
                        : "Desde pregunta (Índice)"}
                    </Label>
                    <Input
                      id="inicio"
                      type="number"
                      min="1"
                      max={!isRazonamientoLogico ? totalDisponible : undefined}
                      value={rangoInicio}
                      onChange={(e) => setRangoInicio(Number(e.target.value))}
                      className="text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fin">
                      {isRazonamientoLogico
                        ? "Pregunta No. (Fin)"
                        : "Hasta pregunta (Índice)"}
                    </Label>
                    <Input
                      id="fin"
                      type="number"
                      min={rangoInicio}
                      max={
                        !isRazonamientoLogico
                          ? Math.min(rangoInicio + 199, totalDisponible || 200)
                          : undefined
                      }
                      value={rangoFin}
                      onChange={(e) => setRangoFin(Number(e.target.value))}
                      className="text-lg font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isRazonamientoLogico
                        ? "Rango de preguntas:"
                        : "Preguntas seleccionadas:"}
                    </span>
                    <span
                      className={`font-bold ${!esValido ? "text-red-500" : ""}`}
                    >
                      {cantidadSeleccionada}
                    </span>
                  </div>
                  {mensajeError && (
                    <p className="text-xs text-red-500 font-medium">
                      {mensajeError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Se cargarán todas las preguntas disponibles para{" "}
                  <span className="font-semibold text-foreground">
                    {disciplinaSeleccionada !== "todas"
                      ? disciplinaSeleccionada
                      : area}
                  </span>
                  .
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full h-12 text-lg gap-2"
              onClick={handleIniciar}
              disabled={!esValido}
            >
              <Play className="w-5 h-5 fill-current" />
              Comenzar Práctica
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  /* ───────────────── RENDER: PRÁCTICA ───────────────── */

  if (preguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          No se encontraron preguntas disponibles para esta área.
        </p>
        <Button variant="outline" onClick={() => setConfigurado(false)}>
          Volver
        </Button>
      </div>
    );
  }

  const preguntaActual = preguntas[currentIndex];
  const progreso = ((currentIndex + 1) / preguntas.length) * 100;

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
            mostrarCorrecta={!!respuestas[currentIndex]} // Feedback inmediato en práctica
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
            {currentIndex === preguntas.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Finalizar Práctica
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* ESTADO */}
        <div className="mt-3 text-center text-sm text-muted-foreground shrink-0">
          {Object.keys(respuestas).length} de {preguntas.length} respondidas
        </div>
      </div>
    </div>
  );
}
