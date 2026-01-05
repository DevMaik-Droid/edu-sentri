"use client";

import { useState, useEffect, useRef } from "react";
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
  BookOpen,
  FileText,
  Eye,
  Volume2,
  Pause,
  Square,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PreguntaUI } from "@/types/pregunta";
import type { TextoLecturaConPreguntas } from "@/types/textos-lectura";
import {
  obtenerPreguntasPorArea,
  obtenerConteoPreguntasPorArea,
  obtenerRangoPreguntas,
  obtenerPreguntasPorTextoLectura,
} from "@/services/preguntas";
import { obtenerTextosLectura } from "@/services/textos-lectura";
import { LoadingLottie } from "@/components/loading-lottie";
import ReactMarkdown from "react-markdown";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import ClientLayout from "../../ClientLayout";

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

type Fase = "configuracion" | "seleccion-textos" | "lectura" | "preguntas";

export default function PracticaAreaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const area = searchParams.get("area") || "";
  const isComprensionLectora = area === "Comprensión Lectora";

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

  // Estados para Comprensión Lectora
  const [fase, setFase] = useState<Fase>("configuracion");
  const [textosDisponibles, setTextosDisponibles] = useState<
    TextoLecturaConPreguntas[]
  >([]);
  const [textosSeleccionados, setTextosSeleccionados] = useState<string[]>([]);
  const [indiceTextoActual, setIndiceTextoActual] = useState(0);
  const [textoActual, setTextoActual] =
    useState<TextoLecturaConPreguntas | null>(null);
  const [showTextoDialog, setShowTextoDialog] = useState(false);

  // Estados de la práctica
  const [preguntas, setPreguntas] = useState<PreguntaUI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Estados para TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs para controlar la lectura secuencial y evitar GC
  const queueRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cargar voces disponibles
  useEffect(() => {
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filtrar voces en español
      const esVoices = allVoices.filter((v) => v.lang.startsWith("es"));

      // Preferencias: Google, Microsoft, luego el resto
      const sortedVoices = esVoices.sort((a, b) => {
        const aScore = a.name.includes("Google")
          ? 2
          : a.name.includes("Microsoft")
          ? 1
          : 0;
        const bScore = b.name.includes("Google")
          ? 2
          : b.name.includes("Microsoft")
          ? 1
          : 0;
        return bScore - aScore;
      });

      // Limitar a 5 voces
      const limitedVoices = sortedVoices.slice(0, 5);
      console.log("Voces cargadas (filtradas):", limitedVoices.length);
      setVoices(limitedVoices);
    };

    updateVoices();

    // Chrome carga voces asíncronamente
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

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

    // Si es Comprensión Lectora, cargar textos disponibles
    if (isComprensionLectora) {
      const cargarTextos = async () => {
        try {
          const textos = await obtenerTextosLectura();
          setTextosDisponibles(textos);
          setFase("seleccion-textos");
        } catch (error) {
          console.error("Error cargando textos:", error);
        } finally {
          setCargandoTotal(false);
        }
      };
      cargarTextos();
      return;
    }

    // Cargar total disponible para otras áreas
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
  }, [area, disciplinaSeleccionada, isComprensionLectora]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ───────────────── INICIO ───────────────── */

  // Función recursiva para leer chunk por chunk (Daisy Chain)
  const speakNextChunk = () => {
    if (
      queueRef.current.length === 0 ||
      currentChunkIndexRef.current >= queueRef.current.length
    ) {
      setIsSpeaking(false);
      setIsPaused(false);
      console.log("Lectura completada (todos los chunks).");
      return;
    }

    const chunkText = queueRef.current[currentChunkIndexRef.current];
    const ut = new SpeechSynthesisUtterance(chunkText);
    utteranceRef.current = ut; // PREVENT GC

    // Asignar voz seleccionada (auto)
    if (voices.length > 0) {
      ut.voice = voices[0];
    }

    ut.lang = "es-ES";
    ut.rate = 1.05; // Un poco más fluido
    ut.pitch = 1;

    ut.onstart = () => {
      if (!isSpeaking) setIsSpeaking(true);
      setIsPaused(false);
    };

    ut.onend = () => {
      currentChunkIndexRef.current++;
      speakNextChunk();
    };

    ut.onerror = (e) => {
      // Ignorar errores por interrupción manual
      if (e.error === "interrupted" || e.error === "canceled") return;
      console.error("Error chunk:", e);
      currentChunkIndexRef.current++;
      speakNextChunk();
    };

    window.speechSynthesis.speak(ut);
  };

  const handleSpeak = () => {
    // Caso: Reanudar desde pausa (SOFT RESUME para mobile)
    if (isPaused) {
      setIsPaused(false);
      setIsSpeaking(true);
      // En lugar de resume(), reiniciamos la lectura desde el índice actual
      // Esto es MUCHO más robusto en móviles
      speakNextChunk();
      return;
    }

    if (isSpeaking) return;

    if (!textoActual?.contenido) {
      console.warn("No hay contenido para leer");
      return;
    }

    window.speechSynthesis.cancel();
    queueRef.current = [];
    currentChunkIndexRef.current = 0;

    // Procesar texto
    // Procesar texto con Normalización PRO
    const normalizarTexto = (texto: string) => {
      return (
        texto
          .replace(/[#*`_\[\]]/g, "") // Limpiar MD
          .replace(/\n+/g, " ") // elimina saltos de línea
          .replace(/\s+/g, " ") // elimina espacios múltiples
          // Elimina paréntesis y CUALQUIER coma dentro de ellos para evitar pausas
          .replace(/\((.*?)\)/g, (_, content) => content.replace(/,/g, ""))
          .replace(/[:;]/g, ",") // : ; -> , para pausa natural
          .trim()
      );
    };

    const cleanText = normalizarTexto(textoActual.contenido);

    // Dividir manteniendo la puntuación para la entonación correcta (PRO)
    // Regex: Segmentos delimitados por , . ; : ! ?
    // Esto crea pausas naturales en comas y pausas largas en puntos
    const chunks = cleanText.match(/[^,.;:!?]+[,.;:!?]?/g) || [cleanText];
    queueRef.current = chunks;

    console.log(`Iniciando lectura secuencial. ${chunks.length} oraciones.`);
    speakNextChunk();
  };

  const handlePause = () => {
    // Soft Pause: Cancelar síntesis pero mantener estado 'Pausado' y el índice actual
    window.speechSynthesis.cancel();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    queueRef.current = [];
    currentChunkIndexRef.current = 0;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Funciones para Comprensión Lectora
  const toggleTextoSeleccionado = (textoId: string) => {
    // Solo permitir seleccionar un texto a la vez
    setTextosSeleccionados([textoId]);
  };

  const handleIniciarLectura = () => {
    if (textosSeleccionados.length === 0) return;

    const primerTexto = textosDisponibles.find(
      (t) => t.id === textosSeleccionados[0]
    );
    if (!primerTexto) return;

    // Limpiar cache si cambió de texto
    if (textoActual && textoActual.id !== primerTexto.id) {
      handleStop(); // Detener lectura si cambia texto
      const oldCacheKey = `texto_${textoActual.id}`;
      localStorage.removeItem(oldCacheKey);
    }

    setTextoActual(primerTexto);
    setIndiceTextoActual(0);
    setFase("lectura");
  };

  const handleComenzarPreguntas = async () => {
    if (!textoActual) return;

    setCargando(true);
    try {
      // Intentar cargar desde localStorage primero
      const cacheKey = `texto_${textoActual.id}`;
      const cached = localStorage.getItem(cacheKey);

      let preguntasDelTexto: PreguntaUI[];

      if (cached) {
        const { preguntas: cachedPreguntas, timestamp } = JSON.parse(cached);
        // Cache válido por 24 horas
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

        if (isValid) {
          preguntasDelTexto = cachedPreguntas;
        } else {
          // Cache expirado, recargar
          preguntasDelTexto = await obtenerPreguntasPorTextoLectura(
            textoActual.id
          );
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              preguntas: preguntasDelTexto,
              texto: textoActual,
              timestamp: Date.now(),
            })
          );
        }
      } else {
        // No hay cache, cargar y guardar
        preguntasDelTexto = await obtenerPreguntasPorTextoLectura(
          textoActual.id
        );
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            preguntas: preguntasDelTexto,
            texto: textoActual,
            timestamp: Date.now(),
          })
        );
      }

      setPreguntas(preguntasDelTexto);
      setCurrentIndex(0);
      setRespuestas({});
      setFase("preguntas");
      setConfigurado(true);
    } catch (error) {
      console.error("Error cargando preguntas:", error);
    } finally {
      setCargando(false);
    }
  };

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
      // Si es comprensión lectora y hay más textos, pasar al siguiente
      if (
        isComprensionLectora &&
        indiceTextoActual < textosSeleccionados.length - 1
      ) {
        const siguienteIndice = indiceTextoActual + 1;
        const siguienteTexto = textosDisponibles.find(
          (t) => t.id === textosSeleccionados[siguienteIndice]
        );

        if (siguienteTexto) {
          setTextoActual(siguienteTexto);
          setIndiceTextoActual(siguienteIndice);
          setFase("lectura");
          setConfigurado(false);
        }
      } else {
        handleFinalizar();
      }
    }
  };

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  /* ───────────────── FINALIZAR ───────────────── */

  const handleFinalizar = () => {
    setIsCalculating(true);
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
    localStorage.setItem("temp_tipo", "practica"); // Tipo "practica" para tabla dedicada
    localStorage.setItem("temp_area", area);
    if (disciplinaSeleccionada && disciplinaSeleccionada !== "todas") {
      localStorage.setItem("temp_disciplina", disciplinaSeleccionada);
    } else {
      localStorage.removeItem("temp_disciplina");
    }

    router.push("/resultados");
  };

  /* ───────────────── RENDER: CONFIGURACIÓN ───────────────── */

  if (isCalculating) {
    return <LoadingLottie message="Calculando resultados..." />;
  }

  if (!configurado) {
    if (cargando || cargandoTotal) return <LoadingLottie size={150} />;

    // Vista de selección de textos para Comprensión Lectora
    if (isComprensionLectora && fase === "seleccion-textos") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="w-full max-w-3xl animate-in fade-in zoom-in duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Seleccionar Textos de Lectura
              </CardTitle>
              <CardDescription>
                Selecciona un texto para practicar comprensión lectora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {textosDisponibles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay textos disponibles en este momento.
                </p>
              ) : (
                textosDisponibles.map((texto) => (
                  <div
                    key={texto.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent ${
                      textosSeleccionados.includes(texto.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleTextoSeleccionado(texto.id)}
                  >
                    <div className="w-5 h-5 mt-1 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          textosSeleccionados.includes(texto.id)
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {textosSeleccionados.includes(texto.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{texto.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {texto.num_preguntas} pregunta
                        {texto.num_preguntas !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12 text-lg gap-2"
                onClick={handleIniciarLectura}
                disabled={textosSeleccionados.length === 0}
              >
                <Play className="w-5 h-5 fill-current" />
                Comenzar Práctica
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Vista de lectura para Comprensión Lectora
    if (isComprensionLectora && fase === "lectura" && textoActual) {
      return (
        <div className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {textosSeleccionados.length > 1 && (
              <div className="mb-6">
                <Progress
                  value={
                    ((indiceTextoActual + 1) / textosSeleccionados.length) * 100
                  }
                  className="h-2"
                />
                <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                  <span>
                    Texto {indiceTextoActual + 1} de{" "}
                    {textosSeleccionados.length}
                  </span>
                </div>
              </div>
            )}

            {/* CARD PRINCIPAL */}
            <Card className="flex flex-col h-[89vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  {textoActual.titulo}
                </CardTitle>
              </CardHeader>

              {/* CONTENIDO CON SCROLL */}
              <CardContent className="flex-1 overflow-y-auto">
                <div className="prose prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: (props) => (
                        <h2
                          className="text-2xl font-bold mt-6 mb-4"
                          {...props}
                        />
                      ),
                      h3: (props) => (
                        <h3
                          className="text-xl font-semibold mt-5 mb-3"
                          {...props}
                        />
                      ),
                      p: (props) => (
                        <p
                          className="mb-4 leading-7 text-foreground/90"
                          {...props}
                        />
                      ),
                      ul: (props) => (
                        <ul
                          className="my-4 ml-6 list-disc space-y-2"
                          {...props}
                        />
                      ),
                      ol: (props) => (
                        <ol
                          className="my-4 ml-6 list-decimal space-y-2"
                          {...props}
                        />
                      ),
                      li: (props) => <li className="leading-7" {...props} />,
                      strong: (props) => (
                        <strong
                          className="font-semibold text-foreground"
                          {...props}
                        />
                      ),
                      em: (props) => <em className="italic" {...props} />,
                    }}
                  >
                    {textoActual.contenido}
                  </ReactMarkdown>
                </div>
              </CardContent>

              {/* FOOTER FIJO */}
              <CardFooter className="shrink-0 border-t flex justify-center gap-1 py-1 h-10">
                {!isSpeaking && !isPaused ? (
                  <Button variant="outline" onClick={handleSpeak}>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Escuchar
                  </Button>
                ) : (
                  <>
                    {isSpeaking ? (
                      <Button variant="outline" onClick={handlePause}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handleSpeak}>
                        <Play className="w-4 h-4 mr-2" />
                        Continuar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleStop}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            {/* BOTONES INFERIORES SIEMPRE VISIBLES */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFase("seleccion-textos");
                  handleStop();
                }}
              >
                Volver a Selección
              </Button>

              <Button
                onClick={() => {
                  handleComenzarPreguntas();
                  handleStop();
                }}
                disabled={cargando}
                className="gap-2"
              >
                {cargando ? (
                  "Cargando..."
                ) : (
                  <>
                    Comenzar Preguntas
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

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
    <ClientLayout>
      <div className="bg-background h-full">
        <div className="container mx-auto px-4 py-2 sm:py-8 h-full flex flex-col">
          {/* PROGRESO */}
          <div className="mb-4 sm:mb-6 shrink-0">
            <Progress value={progreso} className="h-2" />

            <div className="flex justify-between mt-1 text-sm text-muted-foreground items-center">
              <span>Pregunta {currentIndex + 1}</span>
              {isComprensionLectora && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextoDialog(true)}
                  className="h-6 gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
                >
                  <Eye className="w-3 h-3" />
                  Ver Texto
                </Button>
              )}

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
                  {isComprensionLectora &&
                  indiceTextoActual < textosSeleccionados.length - 1
                    ? "Siguiente Texto"
                    : "Finalizar Práctica"}
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

        {/* AlertDialog para mostrar texto de lectura */}
        <AlertDialog open={showTextoDialog} onOpenChange={setShowTextoDialog}>
          <AlertDialogContent className="max-h-[90vh] min-w-[60vw] max-w-[90vw] overflow-hidden flex flex-col">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {textoActual?.titulo || "Texto de Lectura"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {textoActual && (
                <div className="prose prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ ...props }) => (
                        <h2
                          className="text-2xl font-bold mt-6 mb-4 text-foreground"
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="text-xl font-semibold mt-5 mb-3 text-foreground"
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          className="mb-4 leading-7 text-foreground/90"
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="my-4 ml-6 list-disc space-y-2"
                          {...props}
                        />
                      ),
                      ol: ({ ...props }) => (
                        <ol
                          className="my-4 ml-6 list-decimal space-y-2"
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => (
                        <li className="leading-7" {...props} />
                      ),
                      strong: ({ ...props }) => (
                        <strong
                          className="font-semibold text-foreground"
                          {...props}
                        />
                      ),
                      em: ({ ...props }) => (
                        <em className="italic" {...props} />
                      ),
                    }}
                  >
                    {textoActual.contenido}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cerrar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ClientLayout>
  );
}
