"use client";

import { Profile } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function UsersTable({
  profiles,
  onToggleActive,
}: {
  profiles: Profile[];
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  if (!profiles) return <div>Cargando...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No hay usuarios registrados.
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium max-w-[150px]">{profile.nombre}</TableCell>
                <TableCell className="max-w-[200px]">{profile.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={profile.rol === "admin" ? "default" : "secondary"}
                  >
                    {profile.rol}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={profile.activo}
                      onCheckedChange={() =>
                        onToggleActive(profile.id, profile.activo)
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {profile.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px]">{formatDate(profile.fecha_registro)}</TableCell>
                <TableCell className="max-w-[150px]"><span className={`ml-2 px-2 py-1 rounded text-white font-bold ${profile.tipo === "pro" ? "bg-green-600" : "bg-yellow-600"}`}>{profile.tipo.toUpperCase()}</span></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
