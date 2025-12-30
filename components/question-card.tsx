"use client";

import type { PreguntaUI } from "@/types/pregunta";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  pregunta: PreguntaUI;
  numeroActual?: number;
  total?: number;
  respuestaSeleccionada: string | undefined;
  onRespuesta?: (respuesta: string) => void;
  onSeleccionarRespuesta?: (respuesta: string) => void;
  mostrarRespuesta?: boolean;
  mostrarCorrecta?: boolean;
}

type ColoresPorArea = {
  [key: string]: string;
};

const coloresPorArea: ColoresPorArea = {
  "Razonamiento Lógico": "bg-blue-600 text-white",
  "Conocimientos Generales": "bg-green-600 text-white",
  "Comprensión Lectora": "bg-violet-600 text-white",
  "Habilidades Socioemocionales": "bg-pink-600 text-white",
  Default: "bg-gray-600 text-white",
};

const coloresPorDisciplina: ColoresPorArea = {
  "Identificación de Patrones": "bg-blue-100 text-blue-700",
  "Series Numéricas": "bg-blue-100 text-blue-700",
  "Problemas Lógicos": "bg-blue-100 text-blue-700",
  Biología: "bg-green-100 text-green-700",
  Química: "bg-emerald-100 text-emerald-700",
  Física: "bg-cyan-100 text-cyan-700",

  Historia: "bg-amber-100 text-amber-700",
  Geografía: "bg-orange-100 text-orange-700",
  Filosofia: "bg-indigo-100 text-indigo-700",

  Lenguaje: "bg-violet-100 text-violet-700",

  "Técnica Tecnológica": "bg-yellow-100 text-yellow-800",

  Default: "bg-gray-100 text-gray-600",
};

export function QuestionCard({
  pregunta,
  numeroActual,
  total,
  respuestaSeleccionada,
  onRespuesta,
  onSeleccionarRespuesta,
  mostrarRespuesta = false,
  mostrarCorrecta = false,
}: QuestionCardProps) {
  const handleChange = (value: string) => {
    if (onRespuesta) onRespuesta(value);
    if (onSeleccionarRespuesta) onSeleccionarRespuesta(value);
  };

  const mostrar = mostrarRespuesta || mostrarCorrecta;
  const esCorrecta =
    respuestaSeleccionada ===
    pregunta.opciones.find((opcion) => opcion.es_correcta)?.texto;

  console.log(pregunta);
  return (
    <Card
      className={`flex flex-col h-full border-2 p-0 pb-2 transition-all duration-300 ${
        mostrar && esCorrecta
          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
          : ""
      }`}
    >
      {/* 🔝 HEADER (FIJO) */}
      <CardHeader className="m-0 p-0 shrink-0">
        <div
          className={`flex items-center justify-center ${
            coloresPorArea[pregunta.componentes?.nombre || "Default"]
          } rounded-t-lg h-10 text-white font-bold`}
        >
          {pregunta.componentes?.nombre?.toUpperCase()}
        </div>

        {numeroActual && total && (
          <div className="flex items-center justify-between px-5 mt-1">
            <span className="text-xs font-medium text-muted-foreground">
              Pregunta {numeroActual} de {total}
            </span>
            <span
              className={`text-xs px-2 sm:px-3 py-1 ${
                coloresPorDisciplina[pregunta.disciplinas?.nombre || "Default"]
              } rounded-full w-fit`}
            >
              {pregunta.disciplinas?.nombre}
            </span>
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed px-5 mt-2">
          {pregunta.num_pregunta}. {pregunta.enunciado}
        </h2>
      </CardHeader>

      {/* 🧠 CONTENIDO (SCROLL INTERNO) */}
      <CardContent className="flex-1 overflow-y-auto px-5 pb-4">
        <RadioGroup
          value={respuestaSeleccionada}
          onValueChange={handleChange}
          className="space-y-2 sm:space-y-3"
        >
          {pregunta.opciones.map((opcion, index) => {
            const seleccion_correcta =
              respuestaSeleccionada === opcion.texto && opcion.es_correcta;
            const seleccion_incorrecta =
              respuestaSeleccionada === opcion.texto && !opcion.es_correcta;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  seleccion_correcta
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : seleccion_incorrecta
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <RadioGroupItem
                  value={opcion.texto}
                  id={`opcion-${index}`}
                  disabled={mostrar}
                  className="shrink-0"
                />
                <Label
                  htmlFor={`opcion-${index}`}
                  className={`flex-1 cursor-pointer text-sm sm:text-base leading-relaxed ${
                    seleccion_correcta
                      ? "font-semibold text-green-700 dark:text-green-400"
                      : seleccion_incorrecta
                      ? "font-semibold text-red-700 dark:text-red-400"
                      : ""
                  }`}
                >
                  {opcion.texto}
                </Label>
                {seleccion_correcta && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {seleccion_incorrecta && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </div>
            );
          })}
        </RadioGroup>

        {mostrar && !esCorrecta && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-medium text-green-800 dark:text-green-400">
              Respuesta correcta:{" "}
              <span className="font-bold">
                {pregunta.opciones.find((o) => o.es_correcta)?.texto}
              </span>
            </p>
          </div>
        )}

        {mostrar && pregunta.sustento && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
              Explicación:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {pregunta.sustento}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
