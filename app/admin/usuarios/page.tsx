"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminUsuariosPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [mensaje, setMensaje] = useState("")

  const crearUsuario = async () => {
    const res = await fetch("/api/admin/crear-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre }),
    })

    const data = await res.json()
    setMensaje(data.error || "Usuario creado correctamente")
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Crear Usuario</h1>

      <Input placeholder="Nombre" onChange={e => setNombre(e.target.value)} />
      <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <Input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />

      <Button onClick={crearUsuario}>Crear Usuario</Button>

      {mensaje && <p className="text-sm">{mensaje}</p>}
    </div>
  )
}
