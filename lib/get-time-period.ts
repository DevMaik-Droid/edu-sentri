export type TimePeriod = "morning" | "afternoon" | "night";

export interface TimeGradients {
  from: string;
  via?: string;
  to: string;
}

/**
 * Determina el período del día basado en la hora actual
 * @returns 'morning' (6-11), 'afternoon' (12-17), 'night' (18-5)
 */
export function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else {
    return "night";
  }
}

/**
 * Retorna los gradientes de color apropiados para el período del día
 * Colores profesionales optimizados para UX
 *
 * Mañana: Frescura, claridad, energía suave
 * Tarde: Calidez, actividad, estabilidad
 * Noche: Calma, enfoque, descanso visual
 */
export function getTimeGradients(period: TimePeriod): TimeGradients {
  switch (period) {
    case "morning":
      // 🌅 Azul cielo claro → Amarillo sol suave
      return {
        from: "from-sky-100/60", // Similar a #EAF6FF
        via: "via-sky-200/50", // Transición suave
        to: "to-amber-100/55", // Similar a #FFF4CC
      };
    case "afternoon":
      // 🌤️ Beige cálido → Naranja pastel
      return {
        from: "from-orange-50/65", // Similar a #FFF1E6
        via: "via-orange-100/60", // Transición cálida
        to: "to-orange-200/65", // Similar a #FFD6A5
      };
    case "night":
      // 🌙 Azul oscuro profundo → Azul grisáceo
      return {
        from: "from-slate-900/70", // Similar a #0F172A
        via: "via-slate-800/65", // Similar a #1E293B
        to: "to-slate-900/70", // Profundidad
      };
  }
}

/**
 * Retorna clases CSS para el fondo animado
 */
export function getBackgroundClasses(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();
  const gradients = getTimeGradients(currentPeriod);

  return `bg-gradient-to-br ${gradients.from} ${gradients.via} ${gradients.to}`;
}

/**
 * Retorna clases de color para el progress bar según el período
 * Ahora con colores sólidos: celeste, naranja, azul oscuro
 */
export function getProgressColors(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();

  switch (currentPeriod) {
    case "morning":
      return "bg-sky-400"; // Azul celeste
    case "afternoon":
      return "bg-orange-500"; // Naranja
    case "night":
      return "bg-blue-900"; // Azul oscuro
  }
}

/**
 * Retorna clases de color para el timer según el período
 */
export function getTimerColors(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();

  switch (currentPeriod) {
    case "morning":
      return "text-sky-600 dark:text-sky-400";
    case "afternoon":
      return "text-orange-600 dark:text-orange-400";
    case "night":
      return "text-blue-400 dark:text-blue-300";
  }
}

/**
 * Retorna clases de borde decorativo según el período
 */
export function getBorderColors(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();

  switch (currentPeriod) {
    case "morning":
      return "border-sky-200/50 dark:border-sky-700/50";
    case "afternoon":
      return "border-orange-200/50 dark:border-orange-700/50";
    case "night":
      return "border-blue-800/50 dark:border-blue-600/50";
  }
}

/**
 * Retorna clases para botones primarios con gradiente según el período
 */
export function getPrimaryButtonColors(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();

  switch (currentPeriod) {
    case "morning":
      return "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-lg shadow-sky-500/30";
    case "afternoon":
      return "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30";
    case "night":
      return "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30";
  }
}

/**
 * Retorna clases para botones de acento según el período
 */
export function getAccentColors(period?: TimePeriod): string {
  const currentPeriod = period || getTimePeriod();

  switch (currentPeriod) {
    case "morning":
      return "text-sky-600 border-sky-500 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-500 dark:hover:bg-sky-950/30";
    case "afternoon":
      return "text-orange-600 border-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-500 dark:hover:bg-orange-950/30";
    case "night":
      return "text-blue-400 border-blue-500 hover:bg-blue-950/30 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-900/30";
  }
}
