"use server"
import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginAction(email: string, password: string) {
  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 🔥 AQUÍ se escriben las cookies correctamente
  redirect("/dashboard")
}
export async function logoutAction(deviceId: string) {
  const supabase = await createSupabaseServer()

  // 1️⃣ Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2️⃣ Marcar esta sesión como inactiva
  if (user && deviceId) {
    await supabase
      .from("user_sessions")
      .update({ activo: false })
      .eq("user_id", user.id)
      .eq("device_id", deviceId)
  }

  await supabase.auth.signOut()

  return { success: true }
}