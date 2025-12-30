import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER */}
        <header className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EduSentri</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
        </header>

        {/* CONTENIDO */}
        <section className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck className="w-8 h-8" />
            <h2 className="text-3xl font-bold tracking-tight m-0">
              Política de Privacidad
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed text-lg">
            En <strong>EduSentri</strong> valoramos la privacidad de nuestros usuarios y
            estamos comprometidos con la protección de sus datos personales. Esta Política
            de Privacidad explica cómo recopilamos, utilizamos y protegemos la información
            proporcionada al utilizar nuestra plataforma educativa.
          </p>

          {/* 1 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              1. Información que Recopilamos
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos únicamente la información necesaria para el funcionamiento
              de la plataforma, la cual puede incluir:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Correo electrónico</li>
              <li>Identificador de usuario</li>
              <li>Historial de prácticas y resultados</li>
              <li>Información de acceso y sesiones</li>
            </ul>
          </div>

          {/* 2 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              2. Uso de la Información
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Gestionar el acceso a la plataforma</li>
              <li>Controlar la vigencia del servicio</li>
              <li>Mostrar resultados y progreso académico</li>
              <li>Mejorar la experiencia educativa</li>
              <li>Brindar soporte técnico</li>
            </ul>
          </div>

          {/* 3 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              3. Protección de los Datos
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              EduSentri implementa medidas técnicas y organizativas razonables para
              proteger los datos personales del usuario contra accesos no autorizados,
              pérdida, alteración o divulgación indebida.
            </p>
          </div>

          {/* 4 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              4. Uso de Cookies
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              La plataforma utiliza cookies y tecnologías similares para mantener
              sesiones activas, mejorar la navegación y analizar el uso del sistema.
              El usuario puede configurar su navegador para rechazar cookies, aunque
              esto podría afectar algunas funcionalidades.
            </p>
          </div>

          {/* 5 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              5. Compartición de Información
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              EduSentri no vende ni comparte los datos personales de los usuarios
              con terceros, salvo cuando sea requerido por obligación legal.
            </p>
          </div>

          {/* 6 */}
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
            <h3 className="text-xl font-semibold mb-3">
              6. Derechos del Usuario
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              El usuario puede solicitar el acceso, corrección o eliminación de
              su información personal, así como la cancelación de su cuenta,
              a través de los canales oficiales de contacto de la plataforma.
            </p>
          </div>

          {/* FOOTER */}
          <footer className="pt-12 border-t text-sm text-muted-foreground">
            Última actualización: Diciembre 2025
          </footer>
        </section>
      </div>
    </div>
  )
}
