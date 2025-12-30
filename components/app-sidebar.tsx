"use client"

import {
  BookOpen,
  Brain,
  Lightbulb,
  Heart,
  LayoutDashboard,
  GraduationCap,
  FileText,
  RotateCcw,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const areas = [
  { label: "Comprensión Lectora", value: "comprension-lectora", icon: BookOpen },
  { label: "Razonamiento Lógico", value: "razonamiento-logico", icon: Brain },
  { label: "Conocimientos Generales", value: "conocimientos-generales", icon: Lightbulb },
  { label: "Habilidades Socioemocionales", value: "habilidades-socioemocionales", icon: Heart },
]

interface AppSidebarProps {
  onLogout?: () => void
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Plataforma Estudio</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Estudiar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/estudiar"}>
                  <Link href="/estudiar">
                    <BookOpen className="w-4 h-4" />
                    <span>Estudio por Área</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/estudiar/recordar"}>
                  <Link href="/estudiar/recordar">
                    <Brain className="w-4 h-4" />
                    <span>Recordar (Active Recall)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/estudiar/errores"}>
                  <Link href="/estudiar/errores">
                    <RotateCcw className="w-4 h-4" />
                    <span>Repaso de Errores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pruebas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/prueba") && !pathname?.includes("area")}>
                  <Link href="/prueba?tipo=general">
                    <FileText className="w-4 h-4" />
                    <span>Prueba General</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Heart className="w-4 h-4" />
                  <span>Por Área</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {areas.map((area) => {
                    const Icon = area.icon
                    return (
                      <SidebarMenuSubItem key={area.value}>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/prueba?tipo=area&area=${encodeURIComponent(area.label)}`}>
                            <Icon className="w-4 h-4" />
                            <span>{area.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">US</AvatarFallback>
              </Avatar>
              <span className="truncate">Usuario</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
