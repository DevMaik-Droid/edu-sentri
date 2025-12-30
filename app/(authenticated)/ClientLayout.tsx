"use client"

import type React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { GraduationCap } from "lucide-react"
import { logoutAction } from "../actions/auth"
import { getDeviceId } from "@/lib/auth/device"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const handleLogout = async () => {
    const deviceId = getDeviceId()
    await logoutAction(deviceId)
  }

  return (
    <SidebarProvider>
      <AppSidebar onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-4 bg-card/50 backdrop-blur supports-backdrop-filter:bg-card/30">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary hidden sm:block" />
            <span className="font-semibold text-sm sm:text-base">
              Plataforma de Estudio
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto scrollbar-hide">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
