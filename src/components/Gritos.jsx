import { useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from './FrogIcon'

/**
 * La pieza roja del mural: un llamado abierto de un miembro. Vive aquí —y no
 * dentro de Explorar— porque la pinta el mural en compacto y la sección Gritos
 * en grande, y las reglas de cupos, cuota y vencimiento tienen que ser las
 * mismas en los dos sitios.
 */

/* ── Formato ─────────────────────────────────────────────────── */

const fmtCuando = (iso) =>
  new Date(iso).toLocaleString('es-PA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

/**
 * Cuánto falta para que caduque. En días mientras haya margen y en horas el
 * último día: «vence en 0 días» no le dice nada a nadie.
 */
export function cuantoFalta(iso) {
  const ms = new Date(iso) - Date.now()
  if (ms <= 0) return 'ya pasó'
  const horas = Math.floor(ms / 3600000)
  if (horas < 1) return `en ${Math.max(1, Math.floor(ms / 60000))} min`
  if (horas < 24) return `en ${horas} h`
  const dias = Math.floor(horas / 24)
  return `en ${dias} ${dias === 1 ? 'día' : 'días'}`
}

/* ── Cupos ───────────────────────────────────────────────────── */

/**
 * Barras llenas y vacías: el estado se lee sin contar. Por encima de ocho dejan
 * de ser contables de un vistazo, así que ahí solo queda el número.
 */
function Ranuras({ cupos, tomados }) {
  if (cupos > 8) return null
  return (
    <span className="flex gap-1">
      {Array.from({ length: cupos }, (_, i) => (
        <i
          key={i}
          className={`h-4 w-2 rounded-[2px] ${i < tomados ? 'bg-white/30' : 'border border-dashed border-white/75'}`}
        />
      ))}
    </span>
  )
}

/* ── Pieza ───────────────────────────────────────────────────── */

const ESTADOS = {
  Full: 'Se llenó',
  Expired: 'Ya pasó',
  Closed: 'Cerrado',
  Cancelled: 'Cancelado',
}

/**
 * Un grito. `compacta` es la variante del mural: sin botones y sin descripción,
 * porque ahí compite por espacio con otras veinte piezas.
 */
export function GritoPieza({ grito: g, compacta = false, onApuntarme, onSalirme, onCerrar, onCancelar, ocupado }) {
  const faltan = g.slots - g.taken
  const abierto = g.state === 'Open'
  const etiqueta = ESTADOS[g.state]

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-candy to-[#a30026] text-white ${
        compacta ? 'p-4' : 'p-6 shadow-[0_4px_20px_rgba(0,37,32,0.06)]'
      } ${g.state === 'Cancelled' ? 'opacity-60' : ''}`}
    >
      <FrogIcon className="pointer-events-none absolute -bottom-8 -right-6 h-32 w-32 text-white/10" />

      <div className="relative flex items-start justify-between gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
          Grito
        </span>
        {etiqueta && (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-xs uppercase tracking-[0.12em]">
            {etiqueta}
          </span>
        )}
      </div>

      <h3
        className={`relative mt-2 font-display font-semibold uppercase tracking-wide ${
          compacta ? 'text-base leading-tight' : 'text-xl'
        }`}
      >
        {g.title}
      </h3>

      <p className="relative mt-1 font-mono text-xs uppercase tracking-[0.1em] text-white/90">
        {g.place} · {fmtCuando(g.happensAt)}
      </p>

      {!compacta && g.detail && <p className="relative mt-3 text-sm leading-relaxed text-white/85">{g.detail}</p>}

      <div className="relative mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Ranuras cupos={g.slots} tomados={g.taken} />
          <span className="font-display text-lg font-semibold uppercase tracking-wide">
            {abierto ? `Faltan ${faltan}${g.slots > 8 ? ` de ${g.slots}` : ''}` : `${g.taken} de ${g.slots}`}
          </span>
          {g.fee != null && (
            <span className="rounded-full border border-white/45 px-2.5 py-0.5 font-mono text-xs uppercase tracking-[0.12em]">
              cuota ${g.fee}
            </span>
          )}
        </div>

        {/* Quién convoca y cuándo caduca son de la tarjeta completa. En el mural
            la pieza tiene un solo trabajo —dar ganas de abrirla— y en un módulo
            de 142 px en móvil esta línea se sale por debajo. */}
        {!compacta && (
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-white/70">
            {g.authorName} · vence {cuantoFalta(g.happensAt)}
          </p>
        )}

        {!compacta && (
          <div className="mt-4 flex flex-wrap gap-2">
            {abierto && !g.mine && !g.joined && (
              <Boton onClick={onApuntarme} disabled={ocupado || faltan <= 0}>
                {faltan > 0 ? 'Me apunto' : 'Sin cupos'}
              </Boton>
            )}
            {abierto && !g.mine && g.joined && (
              <Boton onClick={onSalirme} disabled={ocupado} suave>
                Ya no voy
              </Boton>
            )}
            {abierto && g.mine && (
              <>
                <Boton onClick={onCerrar} disabled={ocupado} suave>
                  Ya tengo con quién
                </Boton>
                <Boton onClick={onCancelar} disabled={ocupado} suave>
                  Cancelar
                </Boton>
              </>
            )}
            {!g.mine && (
              <Link
                to={`/perfil/${g.authorId}`}
                className="rounded-full px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
              >
                Ver a {g.authorName.split(' ')[0]} →
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Boton({ children, suave = false, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
        suave ? 'border border-white/45 text-white hover:bg-white/15' : 'bg-white text-candy hover:bg-white/90'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Pieza velada para quien no ha iniciado sesión. No lleva datos: el servidor solo
 * dice cuántos gritos hay abiertos, así que aquí no hay nada real que ocultar.
 */
export function GritoVelado({ compacta = false }) {
  return (
    <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-candy to-[#a30026] p-4 text-white">
      <FrogIcon className="pointer-events-none absolute -bottom-8 -right-6 h-32 w-32 text-white/10" />
      <span className="relative font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
        {/* El nombre solo no dice nada a quien llega de fuera: va con su definición. */}
        Grito · plan abierto entre miembros
      </span>
      <div className="relative select-none blur-[6px]" aria-hidden="true">
        <p className={`font-display font-semibold uppercase ${compacta ? 'text-base' : 'text-xl'}`}>
          Alguien está armando un plan
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em]">Un lugar · una fecha · faltan cupos</p>
      </div>
      <Link
        to="/login"
        className="relative mt-3 self-start rounded-full bg-jungle-deep/85 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition hover:bg-jungle-deep"
      >
        Inicia sesión para ver
      </Link>
    </article>
  )
}

/* ── Formulario ──────────────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-rainforest/20 bg-white px-4 py-3 text-jungle placeholder:text-jungle/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelCls = 'mb-1.5 block font-mono text-xs font-semibold uppercase tracking-[0.15em] text-rainforest'

/** Fecha mínima del selector: ahora, en la zona del navegador y sin segundos. */
function ahoraLocal() {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

/**
 * Echar un grito. La fecha es obligatoria porque es lo que hace que caduque solo,
 * y sin caducidad la pared se llena de planes muertos.
 */
export function GritoForm({ onEnviar, onCerrar, enviando }) {
  const [form, setForm] = useState({ title: '', place: '', happensAt: '', slots: 4, fee: '', detail: '' })
  const set = (parche) => setForm((f) => ({ ...f, ...parche }))

  const enviar = (e) => {
    e.preventDefault()
    onEnviar({
      title: form.title.trim(),
      place: form.place.trim(),
      detail: form.detail.trim() || null,
      happensAt: new Date(form.happensAt).toISOString(),
      slots: Number(form.slots),
      fee: form.fee === '' ? null : Number(form.fee),
    })
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-jungle-deep/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={enviar}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-7 shadow-[0_-8px_40px_rgba(0,0,0,0.3)] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-candy">Echa un grito</p>
            <h2 className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide text-jungle">
              ¿A qué convocas?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="flex-none text-2xl leading-none text-jungle/70 transition hover:text-jungle"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="g-title" className={labelCls}>
              El llamado
            </label>
            <input
              id="g-title"
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="¿Quién se apunta a la playa el sábado?"
              className={inputCls}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="g-place" className={labelCls}>
                Dónde
              </label>
              <input
                id="g-place"
                required
                maxLength={200}
                value={form.place}
                onChange={(e) => set({ place: e.target.value })}
                placeholder="Las Lajas"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="g-cuando" className={labelCls}>
                Cuándo
              </label>
              <input
                id="g-cuando"
                type="datetime-local"
                required
                min={ahoraLocal()}
                value={form.happensAt}
                onChange={(e) => set({ happensAt: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="g-cupos" className={labelCls}>
                Cuántos caben
              </label>
              <input
                id="g-cupos"
                type="number"
                required
                min={2}
                max={100}
                value={form.slots}
                onChange={(e) => set({ slots: e.target.value })}
                className={inputCls}
              />
              <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-jungle/70">
                Te cuenta a ti
              </p>
            </div>
            <div>
              <label htmlFor="g-cuota" className={labelCls}>
                Cuota por persona
              </label>
              <input
                id="g-cuota"
                type="number"
                min={0}
                step="0.01"
                value={form.fee}
                onChange={(e) => set({ fee: e.target.value })}
                placeholder="Opcional"
                className={inputCls}
              />
              <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-jungle/70">
                Informativa, no se cobra
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="g-detalle" className={labelCls}>
              Algo más (opcional)
            </label>
            <textarea
              id="g-detalle"
              rows={3}
              maxLength={1000}
              value={form.detail}
              onChange={(e) => set({ detail: e.target.value })}
              placeholder="Salimos temprano, llevo carro para cuatro."
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-candy px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#c30030] disabled:opacity-60"
          >
            {enviando ? 'Gritando…' : 'Echar el grito'}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-jungle/70 transition hover:text-jungle"
          >
            Mejor no
          </button>
        </div>
      </form>
    </div>
  )
}
