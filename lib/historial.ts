import type { IntentoHistorico } from "@/types/pregunta";
import { obtenerHistorialSupabase } from "@/services/intentos";

/**
 * Obtiene el historial de intentos desde Supabase
 * @deprecated Use obtenerHistorialSupabase directly from services/intentos
 */
export async function obtenerHistorial(): Promise<IntentoHistorico[]> {
  return await obtenerHistorialSupabase();
}

export function calcularEstadisticas(historial: IntentoHistorico[]) {
  if (historial.length === 0) {
    return {
      totalIntentos: 0,
      promedioGeneral: 0,
      mejorPuntaje: 0,
      porcentajeMejora: 0,
      promediosPorArea: {},
    };
  }

  const totalIntentos = historial.length;
  const promedioGeneral =
    historial.reduce((acc, intento) => acc + intento.porcentaje, 0) /
    totalIntentos;
  const mejorPuntaje = Math.max(...historial.map((i) => i.porcentaje));

  // Calcular tendencia de mejora (últimos 3 vs primeros 3)
  let porcentajeMejora = 0;
  if (totalIntentos >= 6) {
    const primeros3 =
      historial.slice(0, 3).reduce((acc, i) => acc + i.porcentaje, 0) / 3;
    const ultimos3 =
      historial.slice(-3).reduce((acc, i) => acc + i.porcentaje, 0) / 3;
    porcentajeMejora = ((ultimos3 - primeros3) / primeros3) * 100;
  }

  // Calcular promedios por área
  const promediosPorArea: { [key: string]: number } = {};
  const intentosPorArea: { [key: string]: number[] } = {};

  historial.forEach((intento) => {
    intento.porArea.forEach((areaResult) => {
      if (!intentosPorArea[areaResult.area]) {
        intentosPorArea[areaResult.area] = [];
      }
      intentosPorArea[areaResult.area].push(areaResult.porcentaje);
    });
  });

  Object.entries(intentosPorArea).forEach(([area, porcentajes]) => {
    promediosPorArea[area] =
      porcentajes.reduce((acc, p) => acc + p, 0) / porcentajes.length;
  });

  return {
    totalIntentos,
    promedioGeneral,
    mejorPuntaje,
    porcentajeMejora,
    promediosPorArea,
  };
}
