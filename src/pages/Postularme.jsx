import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import ReenviarVerificacion from '../components/ReenviarVerificacion'
import { authApi } from '../api/auth'
import { useToast } from '../components/Toast'
import { useSession } from '../auth/SessionContext'

const pasos = [
  { id: 1, titulo: 'Tu cuenta', desc: 'Cómo entrarás al colectivo' },
  { id: 2, titulo: 'Tu arte', desc: 'Qué haces y dónde te vemos' },
  { id: 3, titulo: 'Tu porqué', desc: 'Por qué quieres sumarte' },
]

const disciplinas = [
  'Música', 'Muralismo', 'Fotografía', 'Danza', 'Diseño gráfico', 'Poesía / escritura', 'Otra',
]

const inputBase =
  'w-full rounded-xl border border-rainforest/20 bg-white px-4 py-3 text-base text-jungle placeholder:text-jungle/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const inputError = 'border-candy focus:border-candy focus:ring-candy/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest'

const BLANK = { nombre: '', correo: '', clave: '', clave2: '', disciplina: '', telefono: '', motivacion: '' }

/** Panamá. El colectivo es de Chiriquí; el prefijo se da por hecho. */
const COD_PANAMA = '507'
/** Los celulares panameños son de 8 dígitos. */
const LARGO_MAX = 8

const soloDigitos = (v) => (v || '').replace(/\D/g, '')

export default function Postularme() {
  const toast = useToast()
  const { user, loading: cargandoSesion } = useSession()
  const [paso, setPaso] = useState(1)
  const [listo, setListo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(BLANK)
  // Campo señalado tras un error del servidor (p. ej. correo ya registrado).
  const [campoError, setCampoError] = useState(null)
  const correoRef = useRef(null)

  const set = (parcial) => setForm((f) => ({ ...f, ...parcial }))

  /** Devuelve al paso donde vive un campo y lo señala, para poder corregirlo. */
  function señalar(campo, pasoDestino, foco) {
    setCampoError(campo)
    setPaso(pasoDestino)
    // El campo aún no está montado al cambiar de paso: se enfoca tras el repintado.
    requestAnimationFrame(() => foco?.current?.focus())
  }

  const avanzar = async (e) => {
    e.preventDefault()

    // El HTML ya valida requeridos y longitud; aquí va lo que no puede expresar.
    if (paso === 1 && form.clave !== form.clave2) {
      setCampoError('clave2')
      toast.error('Las contraseñas no coinciden.')
      return
    }

    if (paso < 3) {
      setCampoError(null)
      setPaso((p) => p + 1)
      return
    }

    setBusy(true)
    try {
      await authApi.register({
        email: form.correo.trim(),
        password: form.clave,
        fullName: form.nombre.trim(),
        // Se guarda en formato internacional completo: es lo que necesita wa.me
        // para abrir el chat sin que nadie tenga que anteponer el país a mano.
        phone: form.telefono ? `+${COD_PANAMA}${form.telefono}` : null,
        discipline: form.disciplina || null,
        applicationReason: form.motivacion.trim() || null,
      })
      setListo(true)
    } catch (err) {
      // El correo duplicado (409) se detecta al enviar, pero el campo vive en el
      // paso 1: sin devolver al usuario allí, el aviso no es accionable.
      if (err.status === 409) {
        toast.error('Ya existe una cuenta con ese correo. Revísalo o inicia sesión.')
        señalar('correo', 1, correoRef)
      } else {
        toast.error(err.message || 'No se pudo enviar la postulación.')
      }
    } finally {
      setBusy(false)
    }
  }

  const cls = (campo) => `${inputBase} ${campoError === campo ? inputError : ''}`

  // Con sesión abierta el formulario no aplica: crearía una segunda cuenta.
  if (!cargandoSesion && user) {
    return (
      <section className="bg-dorace-pattern relative min-h-screen overflow-hidden bg-jungle pt-16">
        <div className="relative mx-auto max-w-2xl px-5 py-20 text-center">
          <Reveal>
            <FrogIcon className="mx-auto h-16 w-16 text-caribbean" />
            <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">
              Ya tienes una cuenta
            </h1>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-tea/80">
              Iniciaste sesión como <strong className="text-cream">{user.fullName}</strong>. Puedes ver el estado de tu solicitud desde tu panel.
            </p>
            <Link to="/panel" className="mt-8 inline-block rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5">
              Ir a mi panel
            </Link>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-dorace-pattern relative min-h-screen overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -right-32 top-10 h-[38rem] w-[38rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />

      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-5 md:py-24">
        <Reveal className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-caribbean sm:text-sm sm:tracking-[0.35em]">Únete al colectivo</p>
          <h1 className="mt-4 font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-cream sm:text-4xl md:text-5xl">
            Crea tu cuenta y postúlate
          </h1>
        </Reveal>

        {listo ? (
          <Reveal className="mt-10 rounded-3xl border border-caribbean/40 bg-jungle-deep/60 p-7 text-center backdrop-blur sm:p-10 md:p-12">
            <FrogIcon className="mx-auto h-16 w-16 text-caribbean sm:h-20 sm:w-20" />
            <h2 className="mt-6 font-display text-2xl font-semibold uppercase tracking-wide text-cream sm:text-3xl">
              ¡Cuenta creada!
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-tea/80">
              Te enviamos un correo de verificación a <strong className="break-all text-cream">{form.correo}</strong>.
              Confírmalo para completar tu postulación; luego la Junta la revisará.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5"
            >
              Ir a iniciar sesión
            </Link>

            {/* Aquí es donde uno nota que el correo no llegó, así que el reenvío
                debe estar a mano y con la dirección ya puesta. */}
            <div className="mt-8 border-t border-tea/10 pt-6">
              <p className="text-sm leading-relaxed text-tea/55">
                ¿No te llegó? Revisa la carpeta de spam. Si pasados un par de minutos sigue
                sin aparecer, pide otro enlace.
              </p>
              <div className="mt-2">
                <ReenviarVerificacion email={form.correo} compacto />
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={140} className="mt-10 md:mt-12">
            <ol className="mb-6 flex items-center justify-between gap-1.5 sm:mb-8 sm:gap-2">
              {pasos.map((p, i) => {
                const activo = paso === p.id
                const hecho = paso > p.id
                return (
                  <li key={p.id} className="flex flex-1 items-center gap-1.5 last:flex-none sm:gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        aria-current={activo ? 'step' : undefined}
                        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                          activo ? 'bg-caribbean text-jungle' : hecho ? 'bg-rainforest text-cream' : 'bg-jungle-deep/60 text-tea/50'
                        }`}
                      >
                        {hecho ? '✓' : p.id}
                      </span>
                      <span className="hidden sm:block">
                        <span className={`block font-display text-xs font-semibold uppercase tracking-[0.15em] ${activo || hecho ? 'text-cream' : 'text-tea/45'}`}>
                          {p.titulo}
                        </span>
                      </span>
                    </div>
                    {i < pasos.length - 1 && <span className={`h-px flex-1 ${paso > p.id ? 'bg-rainforest' : 'bg-tea/15'}`} />}
                  </li>
                )
              })}
            </ol>

            {/* Título del paso: en móvil sustituye a las etiquetas ocultas del stepper. */}
            <p className="mb-4 text-center font-display text-sm font-semibold uppercase tracking-[0.15em] text-cream sm:hidden">
              {pasos[paso - 1].titulo}
              <span className="mt-0.5 block font-sans text-xs font-normal normal-case tracking-normal text-tea/50">{pasos[paso - 1].desc}</span>
            </p>

            <form onSubmit={avanzar} noValidate={false} className="rounded-3xl border border-tea/10 bg-cream p-6 sm:p-8 md:p-10">
              {/* Altura mínima común a los tres pasos: cada uno tiene distinto número
                  de campos y, sin esto, la tarjeta encoge o crece al avanzar y
                  arrastra consigo el fondo y los degradados de la sección. */}
              <div className="min-h-[27rem] sm:min-h-[25rem]">
              {paso === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nombre" className={labelBase}>Nombre completo</label>
                    <input id="nombre" name="nombre" required autoComplete="name" value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Tu nombre" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="correo" className={labelBase}>Correo</label>
                    <input
                      id="correo" name="email" type="email" required autoComplete="email"
                      inputMode="email" autoCapitalize="none" spellCheck={false}
                      ref={correoRef}
                      value={form.correo}
                      onChange={(e) => { set({ correo: e.target.value }); if (campoError === 'correo') setCampoError(null) }}
                      placeholder="tu@correo.com" className={cls('correo')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="clave" className={labelBase}>Contraseña</label>
                    <input id="clave" name="new-password" type="password" required minLength={8} autoComplete="new-password" value={form.clave} onChange={(e) => set({ clave: e.target.value })} placeholder="Crea una contraseña" className={inputBase} />
                    <p className="text-xs text-jungle/50">Mínimo 8 caracteres.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="clave2" className={labelBase}>Repetir contraseña</label>
                    <input
                      id="clave2" name="confirm-password" type="password" required autoComplete="new-password"
                      value={form.clave2}
                      onChange={(e) => { set({ clave2: e.target.value }); if (campoError === 'clave2') setCampoError(null) }}
                      placeholder="Escríbela otra vez" className={cls('clave2')}
                    />
                    <p className="text-xs text-jungle/50">Aún no hay recuperación de contraseña: si la olvidas, tendrás que pedir ayuda a la Junta.</p>
                  </div>
                </div>
              )}

              {paso === 2 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="disciplina" className={labelBase}>Disciplina principal</label>
                    <select id="disciplina" name="disciplina" className={inputBase} value={form.disciplina} onChange={(e) => set({ disciplina: e.target.value })}>
                      <option value="">¿Qué creas?</option>
                      {disciplinas.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <p className="text-xs text-jungle/50">Podrás afinarla —junto a redes y etiquetas— en tu perfil al ingresar.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="telefono" className={labelBase}>Celular (opcional)</label>
                    {/* El prefijo es fijo y va fuera del campo: así lo que se teclea
                        son solo dígitos y el número queda listo para armar un enlace
                        de WhatsApp sin limpiar guiones, espacios ni paréntesis. */}
                    <div className="flex items-stretch gap-2">
                      <span className={`${inputBase} flex w-auto flex-none items-center gap-1.5 font-mono text-jungle/70`}>
                        <span aria-hidden="true">🇵🇦</span>+{COD_PANAMA}
                      </span>
                      <input
                        id="telefono" name="tel" type="tel" inputMode="numeric" autoComplete="tel-national"
                        value={form.telefono}
                        onChange={(e) => set({ telefono: soloDigitos(e.target.value).slice(0, LARGO_MAX) })}
                        placeholder="60001234" className={inputBase}
                      />
                    </div>
                    <p className="text-xs text-jungle/50">Solo números, sin guiones. Lo usamos para contactarte por WhatsApp.</p>
                  </div>
                </div>
              )}

              {paso === 3 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="motivacion" className={labelBase}>¿Por qué quieres unirte?</label>
                    <textarea id="motivacion" name="motivacion" required rows={5} maxLength={1000} value={form.motivacion} onChange={(e) => set({ motivacion: e.target.value })} placeholder="Cuéntanos qué te mueve del arte, la cultura y la comunidad…" className={`${inputBase} resize-none`} />
                    <p className="text-right text-xs text-jungle/40">{form.motivacion.length}/1000</p>
                  </div>
                  <label className="flex items-start gap-3 text-sm text-jungle/70">
                    <input type="checkbox" required className="mt-1 h-4 w-4 flex-none accent-[#00735e]" />
                    <span>Acepto que Boesh Irí guarde estos datos para revisar mi postulación.</span>
                  </label>
                </div>
              )}
              </div>

              {/* En móvil el botón principal ocupa el ancho y "Atrás" queda debajo:
                  juntos en una fila no caben en pantallas de 320–360 px. */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {paso > 1 ? (
                  <button type="button" onClick={() => { setCampoError(null); setPaso((p) => p - 1) }} className="py-2 font-display text-sm font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:text-jungle">
                    ← Atrás
                  </button>
                ) : (<span className="hidden sm:block" />)}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-candy px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta hover:shadow-[0_8px_30px_rgba(229,0,49,0.3)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-3"
                >
                  {paso < 3 ? 'Continuar' : busy ? 'Enviando…' : 'Enviar postulación'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-tea/60">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-caribbean underline-offset-4 hover:underline">Inicia sesión</Link>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
