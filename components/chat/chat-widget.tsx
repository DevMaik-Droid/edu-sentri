"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chat from "./chat";
import { useChatVisibility } from "@/context/chat-visibility-context";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible } = useChatVisibility();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 sm:bottom-13 right-4 sm:right-18 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] shadow-2xl rounded-lg overflow-hidden border border-border animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="relative h-[550px] bg-white/0">
            <Chat
              apiEndpoint="/api/n8n"
              className="h-full border-0 shadow-none p-0"
            />
          </div>
        </div>
      )}

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 p-0 cursor-pointer",
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-90"
            : "bg-primary hover:bg-primary/90 opacity-80"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white rounded-full" />
        )}
      </Button>
    </div>
  );
}
