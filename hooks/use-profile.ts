"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function useProfile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Load from cache initially to avoid wait
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("edu_sentri_user_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) {
            setUser(parsed.user);
            setEmail(parsed.email);
            setProfile(parsed.profile);
          }
        }
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    const load = async () => {
      // If we found cache above, we don't want to set loading to true blindly.
      // But we can't easily check state here because it hasn't updated yet.
      // So let's rely on checking localStorage again or checking if we initiated it.
      // Simplest is to just set loading true only if we didn't find cache.
      const hasCache =
        typeof window !== "undefined" &&
        !!localStorage.getItem("edu_sentri_user_cache");
      if (!hasCache) setLoading(true);

      // 1️⃣ obtener sesión real
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          if (typeof window !== "undefined")
            localStorage.removeItem("edu_sentri_user_cache");
          setLoading(false);
        }
        return;
      }

      const currentUser = session.user;
      if (mounted) {
        setUser(currentUser);
        setEmail(currentUser.email || "");
      }

      // 2️⃣ obtener perfil
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre")
        .eq("id", currentUser.id)
        .single();

      if (!error && mounted) {
        setProfile(data);
        // Guardar cache
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "edu_sentri_user_cache",
            JSON.stringify({
              user: currentUser,
              email: currentUser.email || "",
              profile: data,
            })
          );
        }
      }

      setLoading(false);
    };

    load();

    // 3️⃣ escuchar cambios de sesión (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setLoading(false);
        if (typeof window !== "undefined")
          localStorage.removeItem("edu_sentri_user_cache");
      } else {
        load();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return {
    user,
    email,
    profile,
    loading,
  };
}
