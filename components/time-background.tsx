"use client";

import { useEffect, useState } from "react";
import {
  getTimePeriod,
  getBackgroundClasses,
  getTextColor,
  type TimePeriod,
} from "@/lib/get-time-period";

interface TimeBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente de fondo dinámico que cambia según la hora del día
 * Implementa gradientes animados y efectos glassmorphism
 */
export function TimeBackground({
  children,
  className = "",
}: TimeBackgroundProps) {
  const [period, setPeriod] = useState<TimePeriod>(() => getTimePeriod());

  useEffect(() => {
    // Actualizar cada minuto para detectar cambios de período
    const interval = setInterval(() => {
      setPeriod(getTimePeriod());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  const backgroundClasses = getBackgroundClasses(period);
  const textColor = getTextColor(period);

  return (
    <div
      className={`relative overflow-hidden ${className} ${textColor}`}
    >
      {/* Capa de gradiente estático (sin animación) */}
      <div
        className={`fixed inset-0 ${backgroundClasses} transition-all duration-1000 ease-in-out`}
        style={{
          // Eliminada la animación de movimiento para un look más tranquilo
          backgroundSize: "cover",
        }}
      />

      {/* Capa de textura sutil */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>

      {/* Eliminadas las keyframes de animación */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
