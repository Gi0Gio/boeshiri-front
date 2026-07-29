import { useState } from 'react'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'

const canales = [
  { etiqueta: 'Correo', valor: 'hola@boeshiri.org', href: 'mailto:hola@boeshiri.org' },
  { etiqueta: 'WhatsApp', valor: '+507 0000-0000', href: null },
  { etiqueta: 'Instagram', valor: '@boeshiri', href: null },
  { etiqueta: 'Ubicación', valor: 'David, Chiriquí — Panamá', href: null },
]

const asuntos = ['Quiero colaborar', 'Proponer un evento', 'Prensa / medios', 'Solo saludar']

const inputBase =
  'w-full rounded-xl border border-rainforest/20 bg-white px-4 py-3 text-jungle placeholder:text-jungle/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest'

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <>
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -left-32 top-0 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
              Hablemos
            </p>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">
              Contacto
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              ¿Una idea, una colaboración, una duda? La rana escucha. Escríbenos y te respondemos
              pronto.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Datos + formulario ───────────────────────────────── */}
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1fr_1.4fr]">
          {/* Panel de canales */}
          <Reveal className="relative overflow-hidden rounded-3xl bg-jungle p-9 text-tea">
            <FrogIcon className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 text-white/5" />
            <h2 className="relative font-display text-2xl font-semibold uppercase tracking-wide text-cream">
              Canales directos
            </h2>
            <p className="relative mt-3 text-sm leading-relaxed text-tea/70">
              Datos de ejemplo — se reemplazarán por los oficiales del colectivo.
            </p>
            <ul className="relative mt-8 space-y-6">
              {canales.map((c) => (
                <li key={c.etiqueta}>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean">
                    {c.etiqueta}
                  </p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="mt-1 block text-lg text-cream transition-colors hover:text-caribbean"
                    >
                      {c.valor}
                    </a>
                  ) : (
                    <p className="mt-1 text-lg text-cream">{c.valor}</p>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Formulario */}
          <Reveal delay={140}>
            {enviado ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-caribbean/40 bg-white p-12 text-center">
                <FrogIcon className="h-20 w-20 text-caribbean" />
                <h2 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-jungle">
                  ¡Mensaje enviado!
                </h2>
                <p className="mt-3 max-w-sm leading-relaxed text-jungle/70">
                  Gracias por escribir. Te responderemos al correo que nos dejaste. (Demo — aún no se
                  envía nada de verdad.)
                </p>
                <button
                  type="button"
                  onClick={() => setEnviado(false)}
                  className="mt-8 rounded-full border border-rainforest px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:bg-rainforest hover:text-cream"
                >
                  Enviar otro
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-rainforest/15 bg-white p-8 shadow-[0_4px_24px_rgba(0,37,32,0.06)] md:p-10"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nombre" className={labelBase}>
                      Nombre
                    </label>
                    <input id="nombre" name="nombre" required placeholder="Tu nombre" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="correo" className={labelBase}>
                      Correo
                    </label>
                    <input
                      id="correo"
                      name="correo"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="asunto" className={labelBase}>
                    Asunto
                  </label>
                  <select id="asunto" name="asunto" className={inputBase} defaultValue="">
                    <option value="" disabled>
                      Selecciona un motivo…
                    </option>
                    {asuntos.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="mensaje" className={labelBase}>
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    rows={5}
                    placeholder="Cuéntanos qué tienes en mente…"
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-8 w-full rounded-full bg-candy px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta hover:shadow-[0_8px_30px_rgba(229,0,49,0.3)]"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
