"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Tipos
export type ChatAction =
  | "auto"
  | "generar_preguntas"
  | "ver_progreso"
  | "acompañar";

export interface ChatMessage {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatProps {
  apiEndpoint: string;
  defaultAction?: ChatAction;
  area?: string;
  className?: string;
}

export default function Chat({
  apiEndpoint,
  defaultAction = "auto",
  area,
  className,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función principal para enviar mensajes
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();

    // 1. Agregar mensaje del usuario al historial local
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // 2. Obtener sesión y token JWT actual
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "No hay sesión activa. Por favor inicia sesión nuevamente."
        );
      }

      const token = session.access_token;

      // 3. Preparar payload
      const payload = {
        mensaje: userText,
        accion: defaultAction,
        area: area || undefined,
      };

      // 4. Enviar request al backend (n8n u otro)
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Requisito crítico
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();

      console.log("Respuesta del backend:", data);

      let botResponseText = "";

      if (data.success === true && data.mensaje) {
        botResponseText = data.mensaje;
      } else {
        botResponseText =
          data.output || data.respuesta || data.message || JSON.stringify(data);
      }

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "system",
        content: botResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");

      // Feedback visual de error en el chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "⚠️ Error al procesar tu mensaje. Intenta nuevamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full h-[600px] flex flex-col shadow-lg", className)}>
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Asistente Educativo
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2">
              <Bot className="w-12 h-12" />
              <p>Envía un mensaje para comenzar...</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {msg.role === "system" && <Bot className="w-3 h-3" />}
                {msg.role === "system" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.role === "user" && <User className="w-3 h-3 opacity-70" />}
              </div>
              <span className="text-[10px] opacity-70 self-end">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
              <div className="flex items-center gap-2">
                <Bot className="w-3 h-3" />
                <span className="flex items-center gap-1">
                  Escribiendo <Loader2 className="w-3 h-3 animate-spin" />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive text-center mt-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <form
            onSubmit={sendMessage}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
