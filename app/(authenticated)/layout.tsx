import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServer()

  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  console.log("USER SERVER:", user)

  if (!user) {
    redirect("/")
  }

  return <>{children}</>
}
