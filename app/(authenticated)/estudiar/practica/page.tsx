"use client"

import { Suspense } from "react"
import PracticaAreaContent from "./practica-content"

export default function PracticaAreaPage() {
  return (
    <Suspense fallback={null}>
      <PracticaAreaContent />
    </Suspense>
  )
}
