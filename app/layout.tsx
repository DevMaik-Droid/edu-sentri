import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "EduSentri",
  description: "Practica y mejora tus conocimientos con nuestro banco de preguntas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  )
}
