import { Link } from 'react-router-dom'
import { PageHeader, Card, Stat, Chip, Reveal, DemoNote } from '../ui'
import { usuarioActual, misPublicaciones, misGrupos } from '../../data/panel'

const accesos = [
  { to: '/panel/perfil', label: 'Editar mi perfil', desc: 'Datos, privacidad y redes' },
  { to: '/panel/publicaciones', label: 'Nueva publicación', desc: 'Artículo, foto, video o música' },
  { to: '/panel/grupos', label: 'Mis grupos', desc: 'Comisiones y equipos + Kanban' },
  { to: '/panel/marketplace', label: 'Mi marketplace', desc: 'Publica y gestiona productos' },
]

const actividad = [
  { txt: 'Publicaste el artículo "Refugio cultural"', cuando: 'hace 2 días' },
  { txt: 'Se te asignó la tarea "Diseñar afiche principal"', cuando: 'hace 3 días' },
  { txt: 'Nuevo artículo oficial de la Junta', cuando: 'hace 5 días' },
]

export default function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Panel del miembro"
        title={`Hola, ${usuarioActual.nombre.split(' ')[0]}`}
        description="Tu centro de control en Boesh Irí: perfil, publicaciones, grupos y marketplace."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><Stat valor={misPublicaciones.length} etiqueta="Publicaciones" /></Reveal>
        <Reveal delay={80}><Stat valor={misGrupos.length} etiqueta="Grupos" tono="#d9f2c2" /></Reveal>
        <Reveal delay={160}><Stat valor="2" etiqueta="Productos" tono="#d67a63" /></Reveal>
        <Reveal delay={240}><Stat valor="6" etiqueta="Asistencias" tono="#e60035" /></Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Accesos rápidos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {accesos.map((a) => (
                <Link key={a.to} to={a.to} className="group rounded-xl border border-tea/10 bg-black/10 p-4 transition hover:-translate-y-0.5 hover:border-caribbean/40 hover:bg-caribbean/[0.06]">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-caribbean">{a.label}</p>
                  <p className="mt-1 text-xs text-tea/50">{a.desc}</p>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Actividad reciente</h2>
            <ul className="mt-4 space-y-4">
              {actividad.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-caribbean shadow-[0_0_8px_rgba(0,230,188,0.6)]" />
                  <div>
                    <p className="text-sm leading-snug text-tea/85">{a.txt}</p>
                    <p className="font-mono text-xs text-tea/40">{a.cuando}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Chip tone="caribbean" className="mt-5">Avisos in-app · correo en v2</Chip>
          </Card>
        </Reveal>
      </div>

      <DemoNote />
    </>
  )
}
