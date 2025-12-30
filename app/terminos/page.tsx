import { Button } from "@/components/ui/button"
import { ArrowLeft, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function TerminosPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">
            Términos y Condiciones de Uso
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            Bienvenido a <strong>EduSentri</strong>. Al acceder y utilizar esta plataforma
            educativa, usted acepta expresamente los presentes Términos y Condiciones.
            Si no está de acuerdo con ellos, deberá abstenerse de utilizar el servicio.
          </p>

          {/* 1 */}
          <h3 className="text-xl font-semibold">1. Descripción del Servicio</h3>
          <p className="text-muted-foreground leading-relaxed">
            EduSentri es una plataforma web de estudio orientada al aprendizaje y
            práctica académica mediante bancos de preguntas, simulaciones y recursos
            educativos.
          </p>

          {/* 2 */}
          <h3 className="text-xl font-semibold">2. Duración del Acceso</h3>
          <p className="text-muted-foreground leading-relaxed">
            El acceso a la plataforma es <strong>temporal</strong> y se habilita únicamente
            durante el periodo contratado o autorizado. Una vez vencido dicho periodo,
            el acceso será suspendido automáticamente sin previo aviso.
          </p>

          {/* 3 */}
          <h3 className="text-xl font-semibold">3. Registro y Cuenta</h3>
          <p className="text-muted-foreground leading-relaxed">
            Para utilizar determinadas funciones, el usuario debe crear una cuenta
            proporcionando información veraz y actualizada. Cada cuenta es personal
            e intransferible.
          </p>

          {/* 4 */}
          <h3 className="text-xl font-semibold">4. Uso Adecuado</h3>
          <p className="text-muted-foreground leading-relaxed">
            El usuario se compromete a utilizar EduSentri únicamente con fines educativos
            y a no realizar acciones que afecten la seguridad, integridad o funcionamiento
            del sistema.
          </p>

          {/* 5 */}
          <h3 className="text-xl font-semibold">5. Pagos y Activación</h3>
          <p className="text-muted-foreground leading-relaxed">
            El acceso a determinadas funcionalidades puede requerir un pago previo.
            La activación del acceso se realiza una vez confirmado el pago por los
            canales establecidos. Los pagos no son reembolsables.
          </p>

          {/* 6 */}
          <h3 className="text-xl font-semibold">6. Propiedad Intelectual</h3>
          <p className="text-muted-foreground leading-relaxed">
            Todos los contenidos, diseños, textos, preguntas y estructura de la plataforma
            son propiedad de EduSentri o se utilizan con fines educativos. Queda prohibida
            su reproducción o distribución sin autorización.
          </p>

          {/* 7 */}
          <h3 className="text-xl font-semibold">7. Limitación de Responsabilidad</h3>
          <p className="text-muted-foreground leading-relaxed">
            EduSentri no garantiza resultados académicos específicos. La plataforma
            se proporciona como herramienta de apoyo y el rendimiento depende del
            uso responsable del usuario.
          </p>

          {/* 8 */}
          <h3 className="text-xl font-semibold">8. Modificaciones</h3>
          <p className="text-muted-foreground leading-relaxed">
            EduSentri se reserva el derecho de modificar estos términos en cualquier
            momento. Las modificaciones entrarán en vigencia desde su publicación
            en la plataforma.
          </p>

          {/* 9 */}
          <h3 className="text-xl font-semibold">9. Contacto</h3>
          <p className="text-muted-foreground leading-relaxed">
            Para consultas, soporte o información adicional, el usuario puede
            comunicarse a través de los canales oficiales indicados en la plataforma.
          </p>

          {/* FOOTER */}
          <footer className="pt-12 border-t text-sm text-muted-foreground">
            Última actualización: Diciembre 2025
          </footer>
        </section>
      </div>
    </div>
  )
}
