"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCw,
  Settings,
  Brain,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PreguntaUI } from "@/types/pregunta";
import { addToReviewQueue } from "@/lib/local-storage";
import ClientLayout from "../../ClientLayout";
import {
  obtenerPreguntasPorArea,
  obtenerConteoPreguntasPorArea,
} from "@/services/preguntas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AREAS_CON_DISCIPLINAS } from "@/lib/constants";

interface Configuracion {
  modo: "aleatorio" | "especifico";
  area: string;
  disciplina: string;
  cantidad: number;
}

export default function RecordarPage() {
  const [preguntasSession, setPreguntasSession] = useState<PreguntaUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [resultado, setResultado] = useState<"correcta" | "incorrecta" | null>(
    null
  );
  const [estadisticas, setEstadisticas] = useState({
    correctas: 0,
    incorrectas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  // Configuración
  const [config, setConfig] = useState<Configuracion>({
    modo: "aleatorio",
    area: "",
    disciplina: "todas",
    cantidad: 20,
  });

  const cargarPreguntas = useCallback(async (cfg: Configuracion) => {
    setLoading(true);
    try {
      let areaToUse = cfg.area;
      const disciplinaToUse = cfg.disciplina;

      // Modo aleatorio: Seleccionar área al azar si no hay una fija
      if (cfg.modo === "aleatorio") {
        const areas = Object.keys(AREAS_CON_DISCIPLINAS);
        areaToUse = areas[Math.floor(Math.random() * areas.length)];
        // Disciplina podría ser 'todas' o una random?
        // Para simplificar, en modo aleatorio puro, usamos 'todas' las de esa área
        // O podríamos elegir una disciplina random.
        // Vamos a mantener 'todas' por defecto para mayor variedad en el área.
        if (cfg.disciplina === "todas" && Math.random() > 0.5) {
          // 50% chance to pick a specific discipline for focused random?
          // Or better: Just fetch from Area ("todas").
        }
      }

      const disciplina =
        disciplinaToUse === "todas" ? undefined : disciplinaToUse;

      // 1. Obtener total
      const total = await obtenerConteoPreguntasPorArea(areaToUse, disciplina);

      if (total === 0) {
        setPreguntasSession([]);
        return;
      }

      // 2. Determinar offset aleatorio
      // Queremos {cantidad} preguntas.
      // Si total <= cantidad, traemos todo (start=0, end=total-1)
      // Si total > cantidad, start = random entre 0 y (total - cantidad)
      const cantidad = cfg.cantidad || 20;
      let start = 0;
      let end = total - 1;

      if (total > cantidad) {
        const maxStart = total - cantidad;
        start = Math.floor(Math.random() * (maxStart + 1));
        end = start + cantidad - 1;
      }

      // 3. Fetch
      // Nota: obtenerPreguntasPorArea para 'Conocimientos Generales' usa indices standard (0-based)
      // Para 'Razonamiento Lógico', usa num_pregunta (1-based IDs approx).
      // El servicio maneja `usarNumPregunta` flag.
      // Aquí, para simplificar "Active Recall" aleatorio, asumiremos el comportamiento por defecto (indices)
      // excepto si sabemos que el servicio lo requiere diferente.
      // Revisando `services/preguntas.ts`: `obtenerPreguntasPorArea` tiene un flag `usarNumPregunta` (default false).
      // Solo `Razonamiento Content` lo usaba en true.
      // Aquí usaremos `false` (offset/limit style) para simplificar la aleatoriedad.

      const preguntas = await obtenerPreguntasPorArea(
        areaToUse,
        start,
        end,
        disciplina
      );

      // Mezclar los resultados para que no estén en orden secuencial del DB
      const mezcladas = preguntas
        .sort(() => Math.random() - 0.5)
        .slice(0, cantidad);

      setPreguntasSession(mezcladas);
      setEstadisticas({ correctas: 0, incorrectas: 0 });
      setCurrentIndex(0);
      setResultado(null);
      setMostrarRespuesta(false);
    } catch (e) {
      console.error("Error cargando preguntas", e);
      setPreguntasSession([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial (Default Aleatorio)
  useEffect(() => {
    cargarPreguntas(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, explicit re-runs via functionality

  const handleAplicarConfig = () => {
    setShowConfig(false);
    // Si modo es aleatorio, limpiar selecciones específicas para la lógica (o mantenerlas si el usuario quiere aleatorio DENTRO de un area?)
    // La petición dice "por defecto aleatorio".
    // Asumiremos:
    // - Aleatorio Global: El sistema elige Area.
    // - Especifico: Usuario elige Area.
    // Si el usuario elige Area "Aleatorio" en el dropdown, es modo aleatorio.
    if (config.area === "Aleatorio" || config.area === "") {
      cargarPreguntas({ ...config, modo: "aleatorio" });
    } else {
      cargarPreguntas({ ...config, modo: "especifico" });
    }
  };

  const handleMostrarRespuesta = () => {
    setMostrarRespuesta(true);
  };

  const handleResultado = (esCorrecta: boolean) => {
    setResultado(esCorrecta ? "correcta" : "incorrecta");
    setEstadisticas((prev) => ({
      correctas: esCorrecta ? prev.correctas + 1 : prev.correctas,
      incorrectas: esCorrecta ? prev.incorrectas : prev.incorrectas + 1,
    }));

    // Guardar error si es incorrecto
    if (!esCorrecta) {
      addToReviewQueue(preguntaActual);
    }
  };

  const handleSiguiente = () => {
    if (currentIndex < preguntasSession.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setMostrarRespuesta(false);
      setResultado(null);
    }
  };

  const handleReiniciar = () => {
    // Recargar con la misma configuración actual (re-roll random questions)
    cargarPreguntas(config);
  };

  // --- Render Configuration ---
  if (showConfig) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Área de Estudio</Label>
                <Select
                  value={config.area || "Aleatorio"}
                  onValueChange={(val) => {
                    setConfig((prev) => ({
                      ...prev,
                      area: val,
                      disciplina: "todas",
                      modo: val === "Aleatorio" ? "aleatorio" : "especifico",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aleatorio">
                      🎲 Aleatorio (Sorpréndeme)
                    </SelectItem>
                    {Object.keys(AREAS_CON_DISCIPLINAS).map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {config.area &&
                config.area !== "Aleatorio" &&
                AREAS_CON_DISCIPLINAS[config.area] && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Disciplina (Opcional)</Label>
                    <Select
                      value={config.disciplina}
                      onValueChange={(val) =>
                        setConfig((prev) => ({ ...prev, disciplina: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">
                          Todas las disciplinas
                        </SelectItem>
                        {AREAS_CON_DISCIPLINAS[config.area].map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              <div className="space-y-2">
                <Label>Cantidad de Preguntas ({config.cantidad})</Label>
                <Input
                  type="number"
                  min={5}
                  max={50}
                  value={config.cantidad}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cantidad: parseInt(e.target.value) || 20,
                    }))
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfig(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleAplicarConfig}>
                  Empezar Práctica
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  // --- Render Loading ---
  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-muted-foreground gap-4">
          <Brain className="w-12 h-12 animate-pulse text-primary/50" />
          <p>Preparando tu sesión de Active Recall...</p>
        </div>
      </ClientLayout>
    );
  }

  // --- Render Empty ---
  if (preguntasSession.length === 0) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="mb-4">
                No se pudieron cargar preguntas con esta configuración.
              </p>
              <Button onClick={() => setShowConfig(true)}>
                Cambiar Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  const preguntaActual = preguntasSession[currentIndex];
  const progreso = ((currentIndex + 1) / preguntasSession.length) * 100;
  const finalizado =
    currentIndex === preguntasSession.length - 1 && resultado !== null;

  // --- Render Main ---
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
                Active Recall
                <Badge variant="secondary" className="text-sm font-normal">
                  {config.modo === "aleatorio"
                    ? "Aleatorio"
                    : config.disciplina !== "todas"
                    ? config.disciplina
                    : config.area}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Intenta responder antes de ver las opciones
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfig(true)}
                title="Configurar sesión"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleReiniciar}
                className="gap-2 bg-transparent"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <Badge
              variant="outline"
              className="gap-1 border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            >
              <CheckCircle className="w-3 h-3" />
              {estadisticas.correctas}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            >
              <XCircle className="w-3 h-3" />
              {estadisticas.incorrectas}
            </Badge>
            <span className="text-sm text-muted-foreground ml-auto">
              {currentIndex + 1} / {preguntasSession.length}
            </span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        <Card className="min-h-[400px] flex flex-col">
          <CardHeader>
            <Badge className="w-fit mb-2">
              {preguntaActual.componentes?.nombre || "General"}
            </Badge>
            <CardTitle className="text-xl leading-relaxed text-balance">
              {preguntaActual.enunciado}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col">
            {!mostrarRespuesta ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
                <Brain className="w-16 h-16 text-muted-foreground/20 mb-6" />
                <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
                  Tómate un momento para recodar la respuesta...
                </p>
                <Button
                  onClick={handleMostrarRespuesta}
                  size="lg"
                  className="gap-2 min-w-[200px]"
                >
                  <Eye className="w-5 h-5" />
                  Ver Respuesta
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                <div className="space-y-3">
                  {preguntaActual.opciones.map((opcion, idx) => {
                    const esCorrecta = opcion.es_correcta;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          esCorrecta
                            ? "border-green-500 bg-green-50 dark:bg-green-950/40"
                            : "border-border bg-muted/30 opacity-70"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {esCorrecta && (
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`${
                              esCorrecta
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {opcion.texto}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {preguntaActual.sustento && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-100">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Explicación
                    </p>
                    <p className="text-sm leading-relaxed opacity-90">
                      {preguntaActual.sustento}
                    </p>
                  </div>
                )}

                {resultado === null ? (
                  <div className="flex gap-4 pt-4 border-t">
                    <div className="w-full">
                      <p className="text-center text-sm text-muted-foreground mb-3">
                        ¿Cómo te fue?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleResultado(false)}
                          variant="outline"
                          className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950 h-12"
                        >
                          <XCircle className="w-5 h-5" />
                          Fallé
                        </Button>
                        <Button
                          onClick={() => handleResultado(true)}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700 h-12 text-white"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Acerté
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 pt-4 border-t animate-in zoom-in-95 duration-200">
                    <div
                      className={`p-4 rounded-lg text-center font-medium ${
                        resultado === "correcta"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {resultado === "correcta"
                        ? "¡Muy bien! sigue así."
                        : "Repasaremos en la sección de errores."}
                    </div>

                    {!finalizado && (
                      <Button
                        onClick={handleSiguiente}
                        size="lg"
                        className="w-full h-12 text-lg"
                      >
                        Siguiente Pregunta
                      </Button>
                    )}

                    {finalizado && (
                      <div className="space-y-3 pt-2">
                        <div className="text-center p-6 bg-muted rounded-lg">
                          <p className="text-3xl font-bold mb-2">
                            {Math.round(
                              (estadisticas.correctas /
                                preguntasSession.length) *
                                100
                            )}
                            %
                          </p>
                          <p className="text-muted-foreground">
                            Precisión de la sesión
                          </p>
                        </div>
                        <Button
                          onClick={handleReiniciar}
                          size="lg"
                          className="w-full gap-2 h-12"
                        >
                          <RotateCw className="w-5 h-5" />
                          Nueva Sesión
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
