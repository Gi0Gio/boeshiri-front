import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { openCallsApi, fechaLarga } from '../api/openCalls'
import { useFetch } from '../hooks/useFetch'
import { useSession } from '../auth/SessionContext'
import { useToast } from '../components/Toast'
import { useSeo } from '../hooks/useSeo'

const inputBase =
  'w-full rounded-xl border border-rainforest/20 bg-white px-4 py-3 text-base text-jungle placeholder:text-jungle/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest'

/**
 * Convocatoria pública: se responde sin cuenta. Arriba, un aviso que invita a
 * unirse al colectivo a quien no es parte; quien entra con su cuenta no escribe
 * nombre ni contacto (la API los toma del perfil).
 */
export default function Convocatoria() {
  const { id } = useParams()
  const { user } = useSession()
  const toast = useToast()
  const { data: c, loading, error } = useFetch(() => openCallsApi.get(id), [id])
  const [datos, setDatos] = useState({ name: '', email: '', phone: '', website: '' })
  const [resp, setResp] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  // Tras enviar se baja a la confirmación: subir al inicio la dejaba fuera de la
  // pantalla del celular, debajo de la descripción.
  const confirmacion = useRef(null)
  useEffect(() => { if (enviada) confirmacion.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [enviada])

  useSeo({
    titulo: c ? `Convocatoria: ${c.title}` : 'Convocatoria',
    descripcion: c?.description?.replace(/\s+/g, ' ').slice(0, 155) || 'Convocatoria abierta de Boesh Irí, colectivo cultural de Chiriquí.',
  })

  const setR = (qid, valor) => setResp((r) => ({ ...r, [qid]: valor }))
  const volver = `/convocatorias/${id}`

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await openCallsApi.submit(id, {
        name: user ? null : datos.name.trim(),
        email: user ? null : datos.email.trim(),
        phone: user ? null : datos.phone.trim() || null,
        website: datos.website,
        answers: c.questions
          .map((q) => q.type === 'Amount'
            ? { questionId: q.id, amount: resp[q.id] === undefined || resp[q.id] === '' ? null : Number(resp[q.id]) }
            : { questionId: q.id, text: (resp[q.id] ?? '').trim() || null })
          .filter((a) => a.text != null || a.amount != null),
      })
      setEnviada(true)
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar. Inténtalo de nuevo.')
    } finally { setEnviando(false) }
  }

  if (loading) return <section className="min-h-screen bg-cream pt-32 text-center text-jungle/70">Cargando…</section>
  if (error || !c) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-cream px-5 pt-16 text-center">
        <div>
          <FrogIcon className="mx-auto h-16 w-16 text-rainforest" />
          <h1 className="mt-5 font-display text-3xl font-semibold uppercase tracking-wide text-jungle">Convocatoria no disponible</h1>
          <p className="mt-2 text-jungle/70">Puede que el enlace esté mal o que aún no se haya abierto.</p>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-rainforest px-6 font-display text-sm uppercase tracking-[0.15em] text-rainforest transition hover:bg-rainforest hover:text-cream">Ir al sitio</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* ── Aviso: unirse al colectivo / responder con tu perfil ── */}
      <div className="bg-tea pt-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-5 py-4 text-jungle sm:flex-row sm:items-center sm:gap-4">
          <FrogIcon className="hidden h-8 w-8 flex-none text-rainforest sm:block" />
          {user ? (
            <p className="text-sm">Respondes como <strong className="font-semibold">{user.fullName}</strong>: usamos el nombre y el contacto de tu perfil.</p>
          ) : (
            <>
              <p className="flex-1 text-sm">
                <strong className="font-semibold">¿Aún no eres parte de Boesh Irí?</strong> Esta convocatoria es abierta, pero también puedes unirte al colectivo.
              </p>
              <span className="flex flex-none flex-wrap gap-x-4">
                <Link to="/postularme" className="inline-flex min-h-11 items-center text-sm font-semibold text-rainforest underline-offset-4 hover:underline">Quiero unirme</Link>
                <Link to={`/login?volver=${encodeURIComponent(volver)}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-rainforest underline-offset-4 hover:underline">Ya soy miembro: entrar</Link>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Cabecera ── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle">
        <div className="pointer-events-none absolute -left-32 top-0 h-[30rem] w-[30rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-5 py-14 md:py-20">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-caribbean">Convocatoria{c.eventTitle ? ` · ${c.eventTitle}` : ''}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-5xl">{c.title}</h1>
            <p className="mt-4 text-tea/85">
              {c.isOpen
                ? (c.closesAt ? `Recibimos propuestas hasta el ${fechaLarga(c.closesAt)}.` : 'Abierta: recibimos propuestas.')
                : `Esta convocatoria ya cerró${c.closesAt ? ` (${fechaLarga(c.closesAt)})` : ''}.`}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          {c.description && (
            <Reveal className="mb-10 whitespace-pre-wrap text-lg leading-relaxed text-jungle/85">{c.description}</Reveal>
          )}

          {enviada ? (
            <div ref={confirmacion} role="status" className="rounded-3xl border border-caribbean/40 bg-white p-10 text-center">
              <FrogIcon className="mx-auto h-16 w-16 text-caribbean" />
              <h2 className="mt-5 font-display text-3xl font-semibold uppercase tracking-wide text-jungle">¡Recibimos tu propuesta!</h2>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-jungle/75">La Junta Directiva la revisará y te contactará al correo{user ? ' de tu perfil' : ' que nos dejaste'}.</p>
              {!user && (
                <p className="mx-auto mt-6 max-w-sm text-jungle/75">
                  Mientras tanto, <Link to="/postularme" className="font-semibold text-rainforest underline underline-offset-4">súmate al colectivo</Link> o <Link to="/comunidad" className="font-semibold text-rainforest underline underline-offset-4">conoce a su gente</Link>.
                </p>
              )}
            </div>
          ) : !c.isOpen ? (
            <div className="rounded-3xl border border-rainforest/15 bg-white p-8 text-center">
              <p className="text-jungle/80">Ya no se reciben respuestas. Mira lo que hace el colectivo en <Link to="/explorar" className="font-semibold text-rainforest underline underline-offset-4">el Mural</Link>.</p>
            </div>
          ) : (
            <form onSubmit={enviar} className="rounded-3xl border border-rainforest/15 bg-white p-6 shadow-[0_4px_24px_rgba(0,37,32,0.06)] sm:p-8 md:p-10">
              {!user && (
                <fieldset className="mb-8 grid gap-5 border-b border-rainforest/10 pb-8 sm:grid-cols-2">
                  <legend className="sr-only">Tus datos</legend>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cv-nombre" className={labelBase}>Nombre</label>
                    <input id="cv-nombre" required autoComplete="name" maxLength={120} value={datos.name} onChange={(e) => setDatos((d) => ({ ...d, name: e.target.value }))} className={inputBase} placeholder="Tu nombre" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cv-correo" className={labelBase}>Correo</label>
                    <input id="cv-correo" type="email" required autoComplete="email" maxLength={320} value={datos.email} onChange={(e) => setDatos((d) => ({ ...d, email: e.target.value }))} className={inputBase} placeholder="tu@correo.com" />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label htmlFor="cv-tel" className={labelBase}>WhatsApp (opcional)</label>
                    <input id="cv-tel" type="tel" autoComplete="tel" maxLength={32} value={datos.phone} onChange={(e) => setDatos((d) => ({ ...d, phone: e.target.value }))} className={inputBase} placeholder="+507 6000-0000" />
                  </div>
                </fieldset>
              )}

              {/* Trampa para robots: oculto para las personas y para el lector de pantalla. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="cv-web">No llenar</label>
                <input id="cv-web" tabIndex={-1} autoComplete="off" value={datos.website} onChange={(e) => setDatos((d) => ({ ...d, website: e.target.value }))} />
              </div>

              <div className="space-y-7">
                {c.questions.map((q) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <label htmlFor={`q-${q.id}`} className={labelBase}>
                      {q.label}{!q.required && <span className="font-sans font-normal normal-case tracking-normal text-jungle/60"> (opcional)</span>}
                    </label>
                    {q.help && <p id={`h-${q.id}`} className="-mt-1 text-sm text-jungle/70">{q.help}</p>}
                    {q.type === 'LongText' ? (
                      <textarea id={`q-${q.id}`} rows={6} required={q.required} maxLength={4000} aria-describedby={q.help ? `h-${q.id}` : undefined}
                        value={resp[q.id] ?? ''} onChange={(e) => setR(q.id, e.target.value)} className={`${inputBase} leading-relaxed`} />
                    ) : q.type === 'Amount' ? (
                      <div className="flex items-stretch overflow-hidden rounded-xl border border-rainforest/20 bg-white focus-within:border-caribbean focus-within:ring-2 focus-within:ring-caribbean/30">
                        <span className="flex items-center border-r border-rainforest/15 bg-cream px-4 font-mono text-jungle/70">$</span>
                        <input id={`q-${q.id}`} type="number" inputMode="decimal" min="0" max="1000000" step="0.01" required={q.required} aria-describedby={q.help ? `h-${q.id}` : undefined}
                          value={resp[q.id] ?? ''} onChange={(e) => setR(q.id, e.target.value)} placeholder="0.00"
                          className="w-full bg-transparent px-4 py-3 font-mono text-base text-jungle placeholder:text-jungle/40 focus:outline-none" />
                      </div>
                    ) : (
                      <input id={`q-${q.id}`} type={q.type === 'Link' ? 'url' : 'text'} inputMode={q.type === 'Link' ? 'url' : undefined}
                        required={q.required} maxLength={q.type === 'Link' ? 500 : 300} aria-describedby={q.help ? `h-${q.id}` : undefined}
                        value={resp[q.id] ?? ''} onChange={(e) => setR(q.id, e.target.value)}
                        placeholder={q.type === 'Link' ? 'https://…' : ''} className={inputBase} />
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={enviando}
                className="mt-10 w-full rounded-full bg-candy px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta hover:shadow-[0_8px_30px_rgba(229,0,49,0.3)] disabled:opacity-60">
                {enviando ? 'Enviando…' : 'Enviar propuesta'}
              </button>
              <p className="mt-3 text-center text-xs text-jungle/60">Solo la Junta Directiva ve tus respuestas.</p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
