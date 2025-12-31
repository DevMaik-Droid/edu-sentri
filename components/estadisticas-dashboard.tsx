"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Award,
  Target,
  BarChart3,
  BookOpen,
  Brain,
  Lightbulb,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { IntentoHistorico } from "@/types/pregunta";
import { calcularEstadisticas } from "@/lib/historial";

interface EstadisticasDashboardProps {
  historial: IntentoHistorico[];
}

const iconosPorArea = {
  "Comprensión Lectora": BookOpen,
  "Razonamiento Lógico": Brain,
  "Conocimientos Generales": Lightbulb,
  "Habilidades Socioemocionales": Heart,
};

const coloresPorArea = {
  "Comprensión Lectora": "text-blue-600",
  "Razonamiento Lógico": "text-purple-600",
  "Conocimientos Generales": "text-amber-600",
  "Habilidades Socioemocionales": "text-rose-600",
};

export function EstadisticasDashboard({
  historial,
}: EstadisticasDashboardProps) {
  // Calcular estadísticas básicas
  const stats = calcularEstadisticas(historial);
  const [statsMastery, setStatsMastery] = useState<Record<
    string,
    number
  > | null>(null);

  useEffect(() => {
    const cargarMastery = async () => {
      const { obtenerEstadisticasMastery } = await import(
        "@/services/intentos"
      );
      const mastery = await obtenerEstadisticasMastery();
      if (mastery) setStatsMastery(mastery);
    };
    cargarMastery();
  }, [historial]);

  // Sobrescribir promedios por área con los de maestría si existen
  // Y recalcular Mejor Puntaje considerando cantidad de preguntas
  if (statsMastery) {
    stats.promediosPorArea = statsMastery;
  }

  // Recalcular Mejor Puntaje: Prioriza Porcentaje > Cantidad Preguntas > Fecha
  if (historial.length > 0) {
    const mejorIntento = [...historial].sort((a, b) => {
      if (b.porcentaje !== a.porcentaje) return b.porcentaje - a.porcentaje;
      if (b.totalPreguntas !== a.totalPreguntas)
        return b.totalPreguntas - a.totalPreguntas;
      return b.fecha.getTime() - a.fecha.getTime();
    })[0];
    stats.mejorPuntaje = mejorIntento.porcentaje;
  }

  if (stats.totalIntentos === 0) {
    return (
      <Card className="mb-6 sm:mb-8">
        <CardContent className="pt-6 text-center py-8 sm:py-12">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-base sm:text-lg font-medium mb-2">
            Aún no hay estadísticas
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
            Completa tu primera prueba para ver tu progreso
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Tu Progreso</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Estadísticas generales de tus intentos
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {stats.totalIntentos}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Intentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {stats.promedioGeneral.toFixed(1)}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Promedio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-chart-2/10 rounded-lg flex-shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {stats.mejorPuntaje.toFixed(1)}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mejor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promedios por área */}
      {Object.keys(stats.promediosPorArea).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Rendimiento por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(stats.promediosPorArea).map(
                ([area, promedio]) => {
                  const Icon =
                    iconosPorArea[area as keyof typeof iconosPorArea];
                  const color =
                    coloresPorArea[area as keyof typeof coloresPorArea];
                  return (
                    <div key={area} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {Icon && (
                            <Icon
                              className={`w-4 h-4 ${color} flex-shrink-0`}
                            />
                          )}
                          <span className="font-medium text-xs sm:text-sm truncate">
                            {area}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold flex-shrink-0">
                          {promedio.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={promedio} className="h-2" />
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos intentos */}
      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <span>Historial de Intentos</span>
              <span className="text-sm font-normal text-muted-foreground">
                {historial.length}{" "}
                {historial.length === 1 ? "intento" : "intentos"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {historial
                .slice()
                .reverse()
                .map((intento) => (
                  <div
                    key={intento.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {intento.tipo === "general"
                          ? "Prueba General"
                          : intento.area}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {intento.fecha.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-lg sm:text-xl font-bold ${
                          intento.porcentaje >= 70
                            ? "text-green-600"
                            : intento.porcentaje >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {intento.porcentaje.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {intento.correctas}/{intento.totalPreguntas}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
