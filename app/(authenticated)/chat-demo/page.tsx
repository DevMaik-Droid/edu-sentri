"use client";

import Chat from "@/components/chat/chat";

export default function ChatDemoPage() {
  // NOTA: Reemplazar con la URL real de tu webhook n8n
  const N8N_WEBHOOK_URL = "http://18.218.185.8:5678/webhook-test/150a07fb-b58e-4417-9032-d5623e6cf8f8";

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Demo de Chat Educativo</h1>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ejemplo 1: Chat General */}
        <div className="space-y-4">
          <Chat
            apiEndpoint={N8N_WEBHOOK_URL}
            defaultAction="auto"
            className="h-[500px]"
          />
        </div>
      </div>
    </div>
  );
}
