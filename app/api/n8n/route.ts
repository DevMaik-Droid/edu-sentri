import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const n8nUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nUrl) {
      console.error(
        "N8N_WEBHOOK_URL no está definida en las variables de entorno"
      );
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // Forward request to n8n
    // Incluimos el userId por si el workflow lo necesita para logging o contexto
    const payload = {
      ...body,
      user_id: user.id,
    };

    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error de n8n (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "Error al comunicarse con el servicio de IA" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en ruta api/n8n:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
