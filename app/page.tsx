// app/page.tsx
import { redirect } from "next/navigation"

import { GraduationCap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { createSupabaseServer } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Plataforma de Estudio</h1>
          <p className="text-muted-foreground">
            Accede a tu cuenta o prueba nuestro demo gratuito
          </p>
        </div>

        <LoginForm />

        <div className="mt-6">
          <Link href="/prueba?tipo=demo">
            <Button variant="outline" className="w-full gap-2">
              Prueba Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
