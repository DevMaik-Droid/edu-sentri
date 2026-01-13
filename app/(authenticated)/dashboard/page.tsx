"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Brain, Lightbulb, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EstadisticasDashboard } from "@/components/estadisticas-dashboard";
import type { IntentoHistorico } from "@/types/pregunta";
import ClientLayout from "../ClientLayout";
import { obtenerHistorialSupabase } from "@/services/intentos";
import { useProfile } from "@/hooks/use-profile";

const areas = [
  {
    value: "Comprensión Lectora",
    icon: BookOpen,
    color: "text-blue-600",
    num_preguntas: 30,
  },
  {
    value: "Razonamiento Lógico",
    icon: Brain,
    color: "text-purple-600",
    num_preguntas: 30,
  },
  {
    value: "Conocimientos Generales",
    icon: Lightbulb,
    color: "text-amber-600",
    num_preguntas: 20,
  },
  {
    value: "Habilidades Socioemocionales",
    icon: Heart,
    color: "text-rose-600",
    num_preguntas: 20,
  },
];

const navegar = (url: string) => {
  window.open(url, "_blank");
};

export default function DashboardPage() {
  const { profile } = useProfile();
  const [historial, setHistorial] = useState<IntentoHistorico[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      setCargando(true);
      const data = await obtenerHistorialSupabase();
      setHistorial(data);
      setCargando(false);
    };
    cargarHistorial();
  }, []);

  const [timeState, setTimeState] = useState({
    greeting: "Hola",
    className: "bg-background",
    subtextClassName: "text-muted-foreground",
  });

  useEffect(() => {
    const cambiarEstilo = async () => {
      const hora = new Date().getHours();
      if (hora >= 5 && hora < 12) {
        setTimeState({
          greeting: "Buenos días",
          className:
            "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20",
          subtextClassName: "text-blue-50",
        });
      } else if (hora >= 12 && hora < 19) {
        setTimeState({
          greeting: "Buenas tardes",
          className:
            "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-500/20",
          subtextClassName: "text-orange-50",
        });
      } else {
        setTimeState({
          greeting: "Buenas noches",
          className:
            "bg-gradient-to-br from-indigo-900 to-slate-800 text-white shadow-lg shadow-indigo-500/20",
          subtextClassName: "text-indigo-100",
        });
      }
    };
    cambiarEstilo();
  }, []);

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div
          className={`mb-6 sm:mb-8 rounded-2xl p-6 sm:p-8 transition-all duration-500 ${timeState.className}`}
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-balance">
            {timeState.greeting}, {profile?.nombre.split(" ")[0]}
          </h1>
          <p
            className={`text-sm sm:text-base text-balance ${timeState.subtextClassName}`}
          >
            Visualiza tu progreso y elige tu próxima prueba
          </p>
        </div>

        {cargando ? (
          <div className="mb-8 space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue="pruebas" className="space-y-4 mb-8">
            <TabsList>
              <TabsTrigger value="pruebas">Pruebas</TabsTrigger>
              {profile?.tipo === "pro" && (
                <TabsTrigger value="practicas">Estudios</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="pruebas">
              <EstadisticasDashboard
                historial={historial.filter(
                  (h) => h.tipo === "general" || h.tipo === "area"
                )}
              />

              <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Link href="/prueba?tipo=general" className="md:col-span-2">
                  <Button
                    size="lg"
                    className="w-full h-14 sm:h-16 text-base sm:text-lg gap-2"
                  >
                    Prueba General (100 Preguntas)
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>

                {areas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <Link
                      key={area.value}
                      href={`/prueba?tipo=area&area=${encodeURIComponent(
                        area.value
                      )}`}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 sm:h-16 text-base sm:text-lg gap-2 sm:gap-3 justify-start bg-card hover:bg-accent/5"
                      >
                        <Icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${area.color} shrink-0`}
                        />
                        <span className="text-left flex-1">
                          {area.value} ({area.num_preguntas})
                        </span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>
            {profile?.tipo === "pro" && (
              <TabsContent value="practicas">
                <EstadisticasDashboard
                  historial={historial.filter((h) => h.tipo === "practica")}
                  modo="practicas"
                />
              </TabsContent>
            )}
          </Tabs>
        )}

        <div className="mt-8 sm:mt-12 grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2">
          <Card
            className="
    w-full h-full cursor-pointer
    bg-linear-to-br from-blue-500/90 to-blue-700
    text-white
    hover:scale-[1.02] hover:shadow-lg
    transition-all duration-300
    rounded-xl
  "
            onClick={() => navegar("https://www.minedu.gob.bo/index.php")}
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 h-full text-center">
              <span className="text-3xl font-bold tracking-wide">MIN EDU</span>
              <span className="text-sm opacity-90">
                Ministerio de Educación
              </span>
            </CardContent>
          </Card>

          <Card
            className="
    w-full h-full
    bg-linear-to-br from-emerald-500/90 to-green-700
    text-white
    hover:scale-[1.02] hover:shadow-lg
    transition-all duration-300
    rounded-xl
  "
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 h-full text-center">
              <Link
                href="/documentos/repositorio_preguntas.pdf"
                target="_blank"
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl font-bold tracking-wide">
                  Repositorio de Preguntas
                </span>
                <span className="text-sm opacity-90">
                  Documento oficial en PDF
                </span>
              </Link>
            </CardContent>
          </Card>

          <Card
            className="
    w-full h-full cursor-pointer
    bg-linear-to-br from-red-500/90 to-red-700
    text-white
    hover:scale-[1.02] hover:shadow-lg
    transition-all duration-300
    rounded-xl
  "
            onClick={() =>
              navegar("https://dgfmegi.minedu.gob.bo/#/admision/inscripcion")
            }
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 h-full text-center">
              <span className="text-3xl font-bold tracking-wide">
                Registro de Postulantes
              </span>
              <span className="text-sm opacity-90">Enlace directo</span>
            </CardContent>
          </Card>

          <Card
            className="
    w-full h-full
    bg-linear-to-br from-blue-500/90 to-purple-700
    text-white
    hover:scale-[1.02] hover:shadow-lg
    transition-all duration-300
    rounded-xl
  "
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 h-full text-center">
              <Link
                href="/documentos/convocatoria.pdf"
                target="_blank"
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl font-bold tracking-wide">
                  Convocatoria Publica
                </span>
                <span className="text-sm opacity-90">
                  Documento oficial en PDF
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
