"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"

export function useProfile() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState<string>("")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)

      // 1️⃣ obtener sesión real
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
        return
      }

      const currentUser = session.user
      if (mounted) setUser(currentUser)
      setEmail(currentUser.email || "")
      // 2️⃣ obtener perfil
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre")
        .eq("id", currentUser.id)
        .single()

      if (!error && mounted) {
        setProfile(data)
      }

      setLoading(false)
    }

    load()

    // 3️⃣ escuchar cambios de sesión (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
  return {
    user,
    email,
    profile,
    loading,
  }
}
