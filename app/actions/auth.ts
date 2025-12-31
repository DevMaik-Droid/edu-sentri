"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function loginAction(
  email: string,
  password: string,
  deviceId: string
) {
  const supabase = await createSupabaseServer();

  // 1. Iniciar sesión con Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuario no encontrado" };
  }

  // 2. Verificar sesiones activas (excluyendo el dispositivo actual)
  const { data: activeSessions, error: sessionError } = await supabase
    .from("user_sessions")
    .select("device_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .neq("device_id", deviceId);

  if (sessionError) {
    await supabase.auth.signOut();
    return { error: "Error al verificar sesiones activas" };
  }

  // Si ya hay 2 o más sesiones activas en OTROS dispositivos, bloquear
  if (activeSessions && activeSessions.length >= 2) {
    await supabase.auth.signOut();
    return {
      error: "Ya tienes 2 sesiones activas. Cierra sesión en otro dispositivo.",
    };
  }

  // 3. Registrar o actualizar la sesión actual
  const userAgent = (await headers()).get("user-agent") || "Unknown";

  const { data: existingSession } = await supabase
    .from("user_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("device_id", deviceId)
    .single();

  if (existingSession) {
    await supabase
      .from("user_sessions")
      .update({ activo: true })
      .eq("id", existingSession.id);
  } else {
    await supabase.from("user_sessions").insert({
      user_id: user.id,
      device_id: deviceId,
      user_agent: userAgent,
      activo: true,
    });
  }

  // 🔥 AQUÍ se escriben las cookies correctamente
  redirect("/dashboard");
}
export async function logoutAction(deviceId: string) {
  const supabase = await createSupabaseServer();

  // 1️⃣ Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2️⃣ Marcar esta sesión como inactiva
  if (user && deviceId) {
    await supabase
      .from("user_sessions")
      .update({ activo: false })
      .eq("user_id", user.id)
      .eq("device_id", deviceId);
  }

  await supabase.auth.signOut();

  return { success: true };
}
