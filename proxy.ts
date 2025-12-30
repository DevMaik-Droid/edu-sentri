import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(req: NextRequest) {
   const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 🔑 sincroniza sesión (ESTO ES LO CRÍTICO)
  await supabase.auth.getUser()

  return res
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/estudiar/:path*",
    "/prueba/:path*",
    "/((?!_next|favicon.ico).*)",
  ],
}
