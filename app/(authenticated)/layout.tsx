import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ChatVisibilityProvider } from "@/context/chat-visibility-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  // 1️⃣ Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2️⃣ Obtener perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, tipo") // Select tipo
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  // 5️⃣ Todo correcto
  return (
    <ChatVisibilityProvider>
      {children}
      {profile.tipo === "pro" && <ChatWidget />}
    </ChatVisibilityProvider>
  );
}
