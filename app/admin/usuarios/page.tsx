"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserDialog } from "./create-user-dialog";
import { UsersTable } from "./users-table";
import { Users, UserCheck, UserPlus } from "lucide-react";

export default function AdminUsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    // Only set loading if we are re-fetching, assuming initial load handles its own state or we want to show spinner on refresh
    // For now, removing setLoading(true) to avoid immediate re-render effects if called internally.
    // If we want to show loading on manual refresh, we can handle it there.

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("fecha_registro", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    
    fetchProfiles();

  }, [fetchProfiles]);


  const toggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setProfiles(
      profiles.map((p) => (p.id === id ? { ...p, activo: !currentStatus } : p))
    );

    const { error } = await supabase
      .from("profiles")
      .update({ activo: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating profile:", error);
      // Revert on error
      setProfiles(
        profiles.map((p) => (p.id === id ? { ...p, activo: currentStatus } : p))
      );
    }
  };

  // Stats calculation
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter((p) => p.activo).length;
  const recentUsers = profiles.filter((p) => {
    if (!p.fecha_registro) return false;
    const date = new Date(p.fecha_registro);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date > sevenDaysAgo;
  }).length;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <CreateUserDialog onUserCreated={fetchProfiles} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos (7 días)
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
          {/* Could add filters here later */}
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : (
          <UsersTable profiles={profiles} onToggleActive={toggleActive} />
        )}
      </div>
    </div>
  );
}
