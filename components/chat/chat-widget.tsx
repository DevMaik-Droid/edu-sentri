"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chat from "./chat";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Solo mostrar en la ruta /estudiar y sus subrutas
  if (!pathname.startsWith("/estudiar")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] shadow-2xl rounded-lg overflow-hidden border border-border animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header personalizado o dejar que el Chat maneje su header. 
               El Chat tiene un header interno, pero podemos agregar un botón de cerrar externo si queremos solapar.
               Para este caso, renderizaremos el Chat tal cual, pero sobreescribiendo estilos si es necesario.
           */}
          <div className="relative h-[500px] bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 w-8 h-8 hover:bg-muted/50 text-muted-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <Chat
              apiEndpoint="/api/n8n"
              className="h-full border-0 shadow-none"
            />
          </div>
        </div>
      )}

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-90"
            : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
