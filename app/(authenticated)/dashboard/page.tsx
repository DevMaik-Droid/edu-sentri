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

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:max-w-4xl">
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
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${area.color} flex-shrink-0`}
                  />
                  <span className="text-left flex-1">{area.value}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 lg:max-w-4xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                1,000
              </p>
              <p className="text-sm text-muted-foreground">
                Preguntas Disponibles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-accent mb-2">
                4
              </p>
              <p className="text-sm text-muted-foreground">
                Áreas de Conocimiento
              </p>
            </CardContent>
          </Card>
          <Card className="xs:col-span-2 lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-chart-3 mb-2">
                100
              </p>
              <p className="text-sm text-muted-foreground">
                Preguntas por Prueba
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
