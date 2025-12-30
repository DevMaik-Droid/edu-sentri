"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Lightbulb, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EstadisticasDashboard } from "@/components/estadisticas-dashboard";
import { obtenerHistorial } from "@/lib/historial";
import type { IntentoHistorico } from "@/types/pregunta";
import ClientLayout from "../ClientLayout";

const areas = [
  { value: "Comprensión Lectora", icon: BookOpen, color: "text-blue-600" },
  { value: "Razonamiento Lógico", icon: Brain, color: "text-purple-600" },
  {
    value: "Conocimientos Generales",
    icon: Lightbulb,
    color: "text-amber-600",
  },
  {
    value: "Habilidades Socioemocionales",
    icon: Heart,
    color: "text-rose-600",
  },
];

const navegar = (url: string) => {
  window.open(url, "_blank");
};

export default function DashboardPage() {
  const [historial, setHistorial] = useState<IntentoHistorico[]>([]);

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Visualiza tu progreso y elige tu próxima prueba
          </p>
        </div>

        <EstadisticasDashboard historial={historial} />

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
                  <span className="text-left flex-1">{area.value}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2">
          <Card className="w-full h-full cursor-pointer hover:bg-accent/5" onClick={() => navegar("https://www.minedu.gob.bo/index.php")}>
            <CardContent className="pt-6 text-center w-full h-full">
              MIN - EDU
            </CardContent>
          </Card>
          <Card className="w-full h-full hover:bg-accent/5">
            <CardContent className="pt-6 text-center  w-full h-full">
              <Link href="/documentos/banco-preguntas.pdf" className="text-primary w-full h-full p-4" target="_blank">BANCO DE PREGUNTAS</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
