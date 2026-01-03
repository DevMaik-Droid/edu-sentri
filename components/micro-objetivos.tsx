"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Objetivo {
  id: number;
  text: string;
  completed: boolean;
}

export function MicroObjetivos() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [newObjetivo, setNewObjetivo] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const obtenerObjetivos = async () => {
      const saved = localStorage.getItem("micro-objetivos");
      if (saved) {
        try {
          setObjetivos(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing objectives", e);
        }
      }
      setIsLoaded(true);
    };
    obtenerObjetivos();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("micro-objetivos", JSON.stringify(objetivos));
    }
  }, [objetivos, isLoaded]);

  const addObjetivo = () => {
    if (newObjetivo.trim()) {
      setObjetivos([
        ...objetivos,
        { id: Date.now(), text: newObjetivo, completed: false },
      ]);
      setNewObjetivo("");
    }
  };

  const toggleObjetivo = (id: number) => {
    setObjetivos(
      objetivos.map((o) =>
        o.id === id ? { ...o, completed: !o.completed } : o
      )
    );
  };

  const removeObjetivo = (id: number) => {
    setObjetivos(objetivos.filter((o) => o.id !== id));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-black/50 font-bold text-[10px] uppercase tracking-widest mb-2 px-4">
        Micro-objetivos
      </SidebarGroupLabel>

      <SidebarGroupContent className="px-2">
        {/* Input */}
        <div className="flex gap-1 mb-3">
          <Input
            value={newObjetivo}
            onChange={(e) => setNewObjetivo(e.target.value)}
            placeholder="Nuevo objetivo..."
            className="
          h-8 text-xs
         
        "
            onKeyDown={(e) => e.key === "Enter" && addObjetivo()}
          />

          <Button
            size="icon"
            variant="ghost"
            className="
          h-8 w-8 shrink-0
          text-black/60
          hover:text-black/80
          hover:bg-sky-200/40
        "
            onClick={addObjetivo}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista */}
        <SidebarMenu className="gap-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border/40">
          {objetivos.map((o) => (
            <SidebarMenuItem
              key={o.id}
              className="
            flex items-center gap-2 px-2 py-1.5 rounded-md
            hover:bg-sky-200/30
            transition-colors
            group
          "
            >
              {/* Check */}
              <button onClick={() => toggleObjetivo(o.id)} className="shrink-0">
                {o.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                ) : (
                  <Circle className="w-4 h-4 text-black/40" />
                )}
              </button>

              {/* Texto */}
              <span
                className={`
              text-xs flex-1 truncate text-black
              ${o.completed ? "line-through text-black/45" : "text-black/70"}
            `}
              >
                {o.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => removeObjetivo(o.id)}
                className="
              opacity-0 group-hover:opacity-100
              text-black/40
              hover:text-rose-400
              transition-all
            "
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
