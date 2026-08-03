import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { publicationsApi } from '../api/publications'
import { useFetch } from '../hooks/useFetch'
import { useSession } from '../auth/SessionContext'
import CompartirBoton from '../components/CompartirBoton'
import { gradientFor } from '../utils/gradient'

const TIPO_LABEL = { News: 'Noticia', Article: 'Artículo', Photo: 'Foto', Video: 'Video', Music: 'Música' }

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })

/* Convierte un enlace de YouTube en su URL de embed, o null si no aplica. */
function youtubeEmbed(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export default function PublicacionDetalle() {
  const { id } = useParams()
  const { user } = useSession()
  const { data: p, loading, error } = useFetch(() => publicationsApi.get(id), [id])

  if (loading) return <section className="flex min-h-screen items-center justify-center bg-cream pt-16 text-jungle/50">Cargando…</section>

  if (error) {
    const noAutorizado = error.status === 401 || error.status === 403
    return (
      <section className="flex min-h-screen items-center justify-center bg-cream pt-16 text-center">
        <div className="px-6">
          <FrogIcon className="mx-auto h-20 w-20 text-rainforest/50" />
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-jungle">
            {noAutorizado ? 'Contenido para miembros' : 'Publicación no disponible'}
          </h1>
          <p className="mt-3 text-jungle/60">
            {noAutorizado && !user
              ? 'Inicia sesión como miembro para ver esta publicación.'
              : 'Puede haber sido ocultada o eliminada.'}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/explorar" className="rounded-full border border-rainforest px-6 py-2.5 font-display text-sm uppercase tracking-[0.15em] text-rainforest transition hover:bg-rainforest hover:text-cream">Explorar</Link>
            {noAutorizado && !user && (
              <Link to="/login" className="rounded-full bg-jungle px-6 py-2.5 font-display text-sm uppercase tracking-[0.15em] text-tea transition hover:bg-jungle-deep">Entrar</Link>
            )}
          </div>
        </div>
      </section>
    )
  }

  const embed = p.type === 'Video' ? youtubeEmbed(p.externalUrl) : null

  return (
    <article className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Link to="/explorar" className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-rainforest hover:underline">← Explorar</Link>

        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-jungle px-3.5 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-tea">{TIPO_LABEL[p.type] ?? p.type}</span>
            {p.visibility === 'Members' && <span className="rounded-full bg-terracotta px-3.5 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white">Solo miembros</span>}
            <span className="text-xs uppercase tracking-wide text-jungle/50">{fmtFecha(p.createdAt)}{p.editedAt && ' · editada'}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-tight text-jungle md:text-5xl">{p.title}</h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <Link to={`/perfil/${p.authorId}`} className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-rainforest hover:underline">Por {p.authorName}</Link>
            <CompartirBoton tipo="publicacion" id={p.id} titulo={p.title} />
          </div>
        </Reveal>

        {/* Media */}
        {embed && (
          <Reveal className="mt-8 aspect-video overflow-hidden rounded-2xl">
            <iframe src={embed} title={p.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </Reveal>
        )}

        {!embed && p.images?.length > 0 && (
          <Reveal className="mt-8 space-y-4">
            {p.images.map((src, i) => (
              <img key={i} src={src} alt={`${p.title} ${i + 1}`} className="w-full rounded-2xl object-cover" />
            ))}
          </Reveal>
        )}

        {!embed && !p.images?.length && p.type !== 'Article' && p.type !== 'News' && (
          <div className="mt-8 aspect-video rounded-2xl" style={{ background: gradientFor(p.id) }} />
        )}

        {/* Cuerpo */}
        {p.body && (
          <Reveal className="mt-8">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-jungle/85">{p.body}</div>
          </Reveal>
        )}

        {/* Enlace externo (música / video sin embed) */}
        {p.externalUrl && !embed && (
          <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-jungle px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tea transition hover:bg-jungle-deep">
            Abrir enlace ↗
          </a>
        )}

        {/* Enlaces de referencia */}
        {p.links?.length > 0 && (
          <Reveal className="mt-10 border-t border-rainforest/15 pt-6">
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-rainforest">Referencias</p>
            <ul className="mt-3 space-y-2">
              {p.links.map((l, i) => (
                <li key={i}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-jungle underline decoration-rainforest/40 underline-offset-2 hover:text-rainforest">{l.title} ↗</a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* Tags */}
        {p.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span key={t} className="rounded-full bg-rainforest/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-rainforest">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
