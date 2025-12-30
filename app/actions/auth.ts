"use server"

import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function loginAction(email: string, password: string) {
  const supabase = await createSupabaseServer()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // 🔑 AQUÍ las cookies se escriben en SERVER
  redirect("/dashboard")
}
