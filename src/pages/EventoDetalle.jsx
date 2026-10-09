import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { eventsApi } from '../api/events'
import { useFetch } from '../hooks/useFetch'
import { useSession } from '../auth/SessionContext'
import { gradientFor } from '../utils/gradient'
import { useSeo } from '../hooks/useSeo'

import { partesFecha, franja, duracion, entrada } from '../utils/eventos'

export default function EventoDetalle() {
  const { id } = useParams()
  const { user } = useSession()
  const { data: e, loading, error } = useFetch(() => eventsApi.get(id), [id])
  const [img, setImg] = useState(0)

  // Antes de los returns tempranos: un hook no puede quedar detrás de un if.
  // El schema Event es el que hace que Google muestre fecha y lugar en el
  // resultado, y el que alimenta las fichas de "eventos cerca de ti".
  useSeo({
    titulo: e ? e.title : 'Evento',
    descripcion: e
      ? `${e.description?.slice(0, 140) || e.category} · ${e.date ? partesFecha(e.date).larga : 'fecha por confirmar'}${e.location ? `, ${e.location}` : ''}.`
      : 'Evento del colectivo Boesh Irí.',
    imagen: e?.images?.[0],
    // Sin fecha no hay schema Event: Google lo exige y uno a medias se marca como error.
    datos: e?.date && {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.title,
      description: e.description || undefined,
      image: e.images?.length ? e.images : undefined,
      startDate: e.date,
      endDate: e.endsAt || undefined,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: e.location
        ? { '@type': 'Place', name: e.location, address: { '@type': 'PostalAddress', addressRegion: 'Chiriquí', addressCountry: 'PA' } }
        : undefined,
      organizer: { '@id': 'https://boeshiri.grupogeshk.com/#organizacion' },
      offers: e.cost == null ? undefined : {
        '@type': 'Offer',
        price: e.cost,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
  })

  if (loading) return <section className="flex min-h-screen items-center justify-center bg-cream pt-16 text-jungle/70">Cargando…</section>

  if (error || !e) {
    const noAutorizado = error?.status === 401 || error?.status === 403
    return (
      <section className="bg-dorace-pattern flex min-h-screen items-center justify-center bg-jungle pt-16 text-center text-tea">
        <div className="px-6">
          <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">
            {noAutorizado ? 'Evento para miembros' : 'Evento no disponible'}
          </h1>
          <p className="mt-3 text-tea/70">
            {noAutorizado && !user
              ? 'Inicia sesión como miembro para ver este evento.'
              : 'Puede haber sido ocultado o eliminado.'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/eventos" className="rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle">Ver eventos</Link>
            {noAutorizado && !user && (
              <Link to="/login" className="rounded-full bg-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-jungle">Entrar</Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  const imagenes = e.images ?? []
  const pasado = Boolean(e.date) && new Date(e.date) < new Date()
  const p = partesFecha(e.date)

  return (
    <article className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link to="/eventos" className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-rainforest hover:underline">← Eventos</Link>

        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-jungle px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-tea">{e.category}</span>
            {e.visibility === 'Members' && <span className="rounded-full bg-terracotta px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-jungle">Solo miembros</span>}
            {pasado && <span className="rounded-full bg-rainforest/15 px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest">Ya ocurrió</span>}
            {e.planning && <span className="rounded-full border border-dashed border-rainforest/50 px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest">En planeación</span>}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-tight text-jungle md:text-5xl">{e.title}</h1>
        </Reveal>

        {imagenes.length > 0 ? (
          <Reveal className="mt-8">
            <div className="aspect-video overflow-hidden rounded-2xl">
              <img src={imagenes[img]} alt={e.title} className="h-full w-full object-cover" />
            </div>
            {imagenes.length > 1 && (
              <div className="mt-3 flex gap-2">
                {imagenes.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} className={`h-16 w-16 flex-none overflow-hidden rounded-xl border-2 ${i === img ? 'border-caribbean' : 'border-transparent'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        ) : (
          <div className="mt-8 aspect-video rounded-2xl" style={{ background: gradientFor(e.id) }} />
        )}

        {/* Los datos prácticos van juntos y arriba: es lo que se busca al abrir. */}
        <Reveal className="mt-8 grid gap-4 rounded-2xl border border-rainforest/15 bg-white p-6 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-rainforest">Cuándo</p>
            {p ? (
              <>
                <p className="mt-1 text-sm capitalize text-jungle">{p.larga}</p>
                <p className="text-sm text-jungle/70">{franja(e.date, e.endsAt)}{duracion(e.date, e.endsAt) && ` · ${duracion(e.date, e.endsAt)}`}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-jungle">Fecha por confirmar</p>
            )}
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-rainforest">Dónde</p>
            <p className="mt-1 text-sm text-jungle">{e.location || 'Por confirmar'}</p>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-rainforest">Costo</p>
            <p className="mt-1 text-sm text-jungle">{entrada(e.cost)}</p>
          </div>
        </Reveal>

        {e.description && (
          <Reveal className="mt-8">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-jungle/85">{e.description}</div>
          </Reveal>
        )}

        {(e.responsibleName || (pasado && e.attendanceCount > 0)) && (
          <Reveal className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-rainforest/15 pt-6 text-sm text-jungle/70">
            {e.responsibleName && <p>Responsable: <span className="text-jungle">{e.responsibleName}</span></p>}
            {/* La asistencia solo tiene sentido una vez ocurrido (RF-EVT-03). */}
            {pasado && e.attendanceCount > 0 && <p>Asistencia: <span className="text-jungle">{e.attendanceCount} personas</span></p>}
          </Reveal>
        )}
      </div>
    </article>
  )
}
