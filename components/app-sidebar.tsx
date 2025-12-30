"use client"

import {
  BookOpen,
  Brain,
  Lightbulb,
  Heart,
  LayoutDashboard,
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
import Image from "next/image"
import { useProfile } from "@/hooks/use-profile"

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

  const { profile, email } = useProfile()
  const pathname = usePathname()


  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-sidebar-border/50">
        <div className="flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="Logo" width={180} height={180} loading="eager" className="w-32 h-32 sm:w-48 sm:h-48" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 space-y-4 scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-bold mb-2 px-4">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-5"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-bold mb-2 px-4">
            Aprendizaje
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/estudiar"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-5"
                >
                  <Link href="/estudiar">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Estudio por Área</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/estudiar/recordar"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-5"
                >
                  <Link href="/estudiar/recordar">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Recordar (Active Recall)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/estudiar/errores"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-5"
                >
                  <Link href="/estudiar/errores">
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-medium">Repaso de Errores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-bold mb-2 px-4">
            Evaluación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/prueba") && !pathname?.includes("area")}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-5"
                >
                  <Link href="/prueba?tipo=general">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Prueba General</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="btn-hover-effect">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Por Área</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {areas.map((area) => {
                    const Icon = area.icon
                    return (
                      <SidebarMenuSubItem key={area.value}>
                        <SidebarMenuSubButton asChild className="btn-hover-effect">
                          <Link href={`/prueba?tipo=area&area=${encodeURIComponent(area.label)}`}>
                            <Icon className="w-5 h-5" />
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

      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar className="w-8 h-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-[10px]">{profile?.nombre?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">{profile?.nombre}</span>
                <span className="text-xs text-sidebar-foreground/70">{email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground/70"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
