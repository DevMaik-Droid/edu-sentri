"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import ReactMarkdown from "react-markdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { chatService } from "@/services/chat";

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
  actionUrl?: string;
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(
    null
  );
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clearHistory = () => {
    if (confirm("¿Estás seguro de querer borrar todo el historial del chat?")) {
      setMessages([]);
      localStorage.removeItem("edu-sentri-chat-history");
      setInitialWelcome();
    }
  };

  // Cargar mensajes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("edu-sentri-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map(
          (m: {
            id: string;
            role: "user" | "system";
            content: string;
            timestamp: string;
          }) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })
        );
        setMessages(hydrated);
      } catch (e) {
        console.error("Error parsing chat history", e);
        setInitialWelcome();
      }
    } else {
      setInitialWelcome();
    }
    setHasLoaded(true);
  }, []);

  const setInitialWelcome = () => {
    setMessages([
      {
        id: "welcome",
        role: "system",
        content:
          "¡Hola! Soy tu asistente de EduSentri. Estoy aquí para ayudarte a potenciar tu aprendizaje. ¿Qué quieres repasar hoy?",
        timestamp: new Date(),
      },
    ]);
  };

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("edu-sentri-chat-history", JSON.stringify(messages));
    }
  }, [messages, hasLoaded]);

  // Auto-scroll al fondo cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar límite inicial
  useEffect(() => {
    const fetchLimit = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const limit = await chatService.getChatLimit(session.user.id);
        setMessagesRemaining(limit);
      } catch (error) {
        console.error("Error fetching limit:", error);
      }
    };
    fetchLimit();
  }, []);

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
      const userId = session.user.id;

      // 2.1 Verificar límite de mensajes (CRÉDITOS RESTANTES)
      const currentCredits = await chatService.getChatLimit(userId);
      setMessagesRemaining(currentCredits);

      if (currentCredits <= 0) {
        setIsLimitDialogOpen(true);
        setIsLoading(false);
        return; // Detener envío
      }

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

      if ((data.success === true || data.success === "true") && data.mensaje) {
        botResponseText = data.mensaje;

        // Si viene una URL, significa que se generaron nuevas preguntas.
        // Limpiamos el caché para que la página cargue las nuevas.
        if (data.url) {
          localStorage.removeItem("edu-sentri-ia-questions");
        }
      } else {
        botResponseText =
          data.output || data.respuesta || data.message || JSON.stringify(data);
      }

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "system",
        content: botResponseText,
        timestamp: new Date(),
        actionUrl: data.url || undefined,
      };

      setMessages((prev) => [...prev, botMessage]);

      // 5. Actualizar contador en DB (Restar 1 crédito)
      const newBalance = await chatService.decrementChatLimit(userId);
      if (newBalance !== null) {
        setMessagesRemaining(newBalance);
      }
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
    <Card
      className={cn(
        "w-full h-[600px] flex flex-col shadow-xl border-none rounded-2xl overflow-hidden bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <AlertDialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Límite Alcanzado</AlertDialogTitle>
            <AlertDialogDescription>
              Ya alcanzaste tu límite, vuelve a intentar mañana.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsLimitDialogOpen(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Moderno */}
      <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground leading-none">
              EduSentri AI (Desarrollo)
            </h3>
            <span className="text-xs text-muted-foreground font-medium mt-1">
              Asistente Educativo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messagesRemaining !== null && (
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Créditos
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  messagesRemaining > 0 ? "text-primary" : "text-destructive"
                )}
              >
                {messagesRemaining} restantes
              </span>
            </div>
          )}
          {messages.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
              onClick={clearHistory}
              title="Limpiar chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {/* Aviso de Límite de Almacenamiento Local (Discreto) */}
        {messages.length > 40 && (
          <div className="absolute top-0 inset-x-0 z-10 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] py-1 text-center font-medium border-b border-orange-100 dark:border-orange-900/50">
            Historial extenso. Considera limpiar el chat para un mejor
            rendimiento.
          </div>
        )}

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-foreground/80">¡Bienvenido!</p>
                <p className="text-sm max-w-[200px]">
                  Empieza una conversación para repasar tus conocimientos.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-3",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border shadow-sm shrink-0">
                  {isUser ? (
                    <>
                      <AvatarImage src="/avatars/user.png" alt="Usuario" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/avatars/bot.png" alt="Bot" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={cn(
                    "flex flex-col max-w-[85%] sm:max-w-[75%]",
                    isUser ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 shadow-sm text-sm relative group",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                        : "bg-muted/50 dark:bg-muted/30 text-foreground border border-border/50 rounded-2xl rounded-tl-sm"
                    )}
                  >
                    {msg.role === "system" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-all leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {msg.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full sm:w-auto bg-background/50 hover:bg-background border-primary/20 text-primary hover:text-primary"
                            onClick={() =>
                              (window.location.href = msg.actionUrl!)
                            }
                          >
                            <span className="mr-2">🚀</span> Ver pregunta
                            generada
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1",
                      isUser ? "text-right" : "text-left"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex w-full gap-3">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border shadow-sm shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Escribiendo
                </span>
                <div className="flex gap-1 items-center h-2">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center my-2">
              <span className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full border border-destructive/20 font-medium">
                {error}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/80 backdrop-blur-md border-t">
          <form
            onSubmit={sendMessage}
            className="flex w-full items-end gap-2 relative bg-muted/40 p-1.5 rounded-3xl border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"
          >
            <div className="flex-1 min-h-[40px] relative">
              <Input
                type="text"
                placeholder="Escribe tu mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="w-full h-full min-h-[40px] border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-sm resize-none placeholder:text-muted-foreground/60"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "rounded-full h-10 w-10 shrink-0 transition-all duration-300",
                inputValue.trim()
                  ? "bg-primary hover:bg-primary/90 shadow-md scale-100"
                  : "bg-muted-foreground/20 text-muted-foreground shadow-none scale-90 opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground/60">
              La IA puede cometer errores. Verifica la información importante.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
