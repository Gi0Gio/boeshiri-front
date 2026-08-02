import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, Toggle, Btn, Chip, Reveal, inputCls, labelCls } from '../ui'
import { profileApi } from '../../api/profile'
import { useFetch } from '../../hooks/useFetch'
import ImageUpload from '../../components/ImageUpload'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import { useSession } from '../../auth/SessionContext'

/** Redes editables; el orden y prefijo son cosméticos. type = enum de la API. */
const REDES = [
  { type: 'Instagram', label: 'Instagram', prefijo: '@', ph: 'tuusuario' },
  { type: 'Tiktok', label: 'TikTok', prefijo: '@', ph: 'tuusuario' },
  { type: 'Whatsapp', label: 'WhatsApp', prefijo: '', ph: '+507 6000-0000' },
  { type: 'Discord', label: 'Discord', prefijo: '', ph: 'usuario#0001' },
  { type: 'Mail', label: 'Mail público', prefijo: '', ph: 'hola@correo.com' },
  { type: 'Web', label: 'Sitio web', prefijo: '', ph: 'https://…' },
]

function toForm(d) {
  const redes = {}
  for (const r of REDES) {
    const found = (d.socialLinks ?? []).find((s) => s.type === r.type)
    redes[r.type] = { value: found?.value ?? '', visible: found?.visible ?? true }
  }
  return {
    fullName: d.fullName ?? '',
    bio: d.bio ?? '',
    intro: d.intro ?? '',
    discipline: d.discipline ?? '',
    location: d.location ?? '',
    photoUrl: d.photoUrl ?? '',
    tags: d.tags ?? [],
    skills: (d.skills ?? []).map((s) => ({ name: s.name, level: s.level })),
    privacy: d.privacy ?? { showPhone: false, showEmail: false, showWhatsapp: false, showCommittees: true, showHistory: true },
    redes,
  }
}

const NIVELES = ['Básico', 'Principiante', 'Intermedio bajo', 'Intermedio', 'Intermedio alto', 'Avanzado', 'Muy avanzado', 'Experto']

export default function MiPerfil() {
  const { data, loading, error } = useFetch(() => profileApi.me())
  const [form, setForm] = useState(null)
  const [nuevaTag, setNuevaTag] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const { logout } = useSession()
  const navigate = useNavigate()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  // Copia de lo guardado, para saber si queda algo sin aplicar.
  const [original, setOriginal] = useState(null)
  const [avisoOculto, setAvisoOculto] = useState(false)

  useEffect(() => {
    if (!data) return
    const inicial = toForm(data)
    setForm(inicial)
    setOriginal(inicial)
  }, [data])

  // Cualquier edición posterior vuelve a mostrar el aviso: la «✕» lo aparta de la
  // vista, no da los cambios por descartados.
  useEffect(() => { setAvisoOculto(false) }, [form])

  if (loading) return <p className="text-tea/50">Cargando perfil…</p>
  if (error || !form) return <p className="text-candy">No se pudo cargar tu perfil.</p>

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Comparación por serialización: el formulario es plano (texto, booleanos,
  // arrays de objetos simples) y así se detecta también el reordenado.
  const hayCambios = original !== null && JSON.stringify(form) !== JSON.stringify(original)

  async function cerrarSesion() {
    const ok = await confirm({
      title: '¿Cerrar sesión?',
      message: 'Saldrás del panel en este dispositivo. Tendrás que volver a entrar con tu correo y contraseña.',
      danger: true,
      confirmLabel: 'Cerrar sesión',
    })
    if (!ok) return
    logout()
    navigate('/')
  }
  const setRed = (type, patch) => setForm((f) => ({ ...f, redes: { ...f.redes, [type]: { ...f.redes[type], ...patch } } }))

  const faltantes = [
    !form.bio && 'descripción',
    !form.discipline && 'disciplina',
    !form.photoUrl && 'foto',
    form.tags.length === 0 && 'etiquetas',
    !REDES.some((r) => form.redes[r.type]?.value) && 'redes de contacto',
  ].filter(Boolean)

  const addTag = () => {
    const t = nuevaTag.trim()
    if (t && !form.tags.some((x) => x.toLowerCase() === t.toLowerCase())) set({ tags: [...form.tags, t] })
    setNuevaTag('')
  }
  const removeTag = (t) => set({ tags: form.tags.filter((x) => x !== t) })

  const addSkill = () => setForm((f) => ({ ...f, skills: [...f.skills, { name: '', level: 4 }] }))
  const setSkill = (i, patch) => setForm((f) => ({ ...f, skills: f.skills.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))
  const removeSkill = (i) => setForm((f) => ({ ...f, skills: f.skills.filter((_, j) => j !== i) }))

  async function guardar() {
    setSaving(true); setMsg(null)
    try {
      const skills = form.skills
        .map((s) => ({ name: s.name.trim(), level: s.level }))
        .filter((s) => s.name)
      await profileApi.update({ fullName: form.fullName, bio: form.bio || null, intro: form.intro || null, discipline: form.discipline || null, location: form.location || null, photoUrl: form.photoUrl || null, tags: form.tags, skills })
      await profileApi.updatePrivacy(form.privacy)
      const links = REDES
        .map((r) => ({ type: r.type, value: (form.redes[r.type]?.value || '').trim(), visible: !!form.redes[r.type]?.visible }))
        .filter((l) => l.value)
      await profileApi.updateSocialLinks(links)
      // Lo guardado pasa a ser la nueva referencia: sin esto el aviso seguiría
      // ahí después de guardar, comparando contra un estado ya viejo.
      setOriginal(form)
      setMsg({ ok: true, text: 'Perfil guardado.' })
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Aviso de cambios sin aplicar, pegado bajo la cabecera del panel.
          Arriba y no abajo a propósito: en móvil el teclado ocupa la mitad
          inferior y taparía justo el botón de guardar mientras escribes. */}
      {hayCambios && !avisoOculto && (
        <div className="sticky top-16 z-20 -mx-5 mb-6 px-5">
          <div className="aviso-cambios flex items-center gap-3 rounded-2xl border border-caribbean/40 bg-jungle px-4 py-3 shadow-[0_12px_40px_rgba(0,17,14,0.6)]">
            <span className="h-2 w-2 flex-none rounded-full bg-caribbean" />
            <p className="min-w-0 flex-1 text-sm text-tea">Tienes cambios sin guardar.</p>
            <Btn onClick={guardar} disabled={saving} className="flex-none px-5 py-2">
              {saving ? 'Guardando…' : 'Guardar'}
            </Btn>
            <button
              type="button"
              onClick={() => setAvisoOculto(true)}
              aria-label="Ocultar el aviso (los cambios no se pierden)"
              title="Ocultar aviso"
              className="flex-none px-1 text-lg leading-none text-tea/40 transition hover:text-tea"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <PageHeader
        eyebrow="Miembro"
        title="Mi perfil"
        description="Tu perfil funciona como portafolio público. Tú controlas qué se muestra."
        actions={<Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Btn>}
      />


      {faltantes.length > 0 && (
        <Reveal className="mb-6 rounded-2xl border border-candy/30 bg-candy/8 p-5">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-candy">Completa tu perfil</p>
          <p className="mt-1.5 text-sm text-tea/70">
            Tu portafolio se ve más completo (y aparece mejor en la Comunidad) si agregas: {faltantes.map((f, i) => (
              <span key={f}>{i > 0 ? ', ' : ''}<strong className="text-cream">{f}</strong></span>
            ))}.
          </p>
        </Reveal>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <Card>
            <ImageUpload value={form.photoUrl} onChange={(url) => set({ photoUrl: url })} folder="avatars" label="Foto de perfil" />
            <div className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={`${inputCls} mt-1.5`} value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Disciplina</label>
                <input className={`${inputCls} mt-1.5`} value={form.discipline} onChange={(e) => set({ discipline: e.target.value })} placeholder="Muralismo, Música, Fotografía…" />
              </div>
              <div>
                <label className={labelCls}>Ubicación (opcional)</label>
                <input className={`${inputCls} mt-1.5`} value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Chiriquí, Panamá" />
                <p className="mt-1.5 font-mono text-[0.65rem] text-tea/40">Se muestra como pill en tu perfil solo si la rellenas.</p>
              </div>
              <div>
                <label className={labelCls}>Descripción corta</label>
                <textarea rows={3} className={`${inputCls} mt-1.5 resize-none`} value={form.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="Una línea que te resuma. Se muestra bajo tu nombre." />
              </div>
              <div>
                <label className={labelCls}>Introducción larga</label>
                <textarea rows={5} className={`${inputCls} mt-1.5 resize-none`} value={form.intro} onChange={(e) => set({ intro: e.target.value })} placeholder="Sección «Introducción» de tu portafolio: tu historia, tu enfoque, lo que te mueve…" />
              </div>
              <div>
                <label className={labelCls}>Etiquetas (cosméticas)</label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {form.tags.map((t) => (
                    <button key={t} onClick={() => removeTag(t)} className="group">
                      <Chip tone="caribbean">{t} <span className="text-caribbean/60 group-hover:text-candy">✕</span></Chip>
                    </button>
                  ))}
                  <input
                    value={nuevaTag}
                    onChange={(e) => setNuevaTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="+ añadir"
                    className="w-24 rounded-full border border-dashed border-tea/25 bg-transparent px-3 py-0.5 font-mono text-[0.7rem] text-tea placeholder:text-tea/40 focus:border-caribbean focus:outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-tea/40">Describen tu trabajo; no otorgan permisos. Enter para añadir, clic para quitar.</p>
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={100}>
            <Card>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Privacidad</h2>
              <p className="mt-1 text-xs text-tea/45">Visibles por defecto: foto, nombre, descripción, etiquetas y publicaciones públicas.</p>
              <div className="mt-3 divide-y divide-tea/8">
                <Toggle label="Mostrar teléfono" checked={form.privacy.showPhone} onChange={(v) => set({ privacy: { ...form.privacy, showPhone: v } })} />
                <Toggle label="Mostrar correo personal" checked={form.privacy.showEmail} onChange={(v) => set({ privacy: { ...form.privacy, showEmail: v } })} />
                <Toggle label="Mostrar WhatsApp" checked={form.privacy.showWhatsapp} onChange={(v) => set({ privacy: { ...form.privacy, showWhatsapp: v } })} />
                <Toggle label="Mostrar comisiones / equipos" checked={form.privacy.showCommittees} onChange={(v) => set({ privacy: { ...form.privacy, showCommittees: v } })} />
                <Toggle label="Mostrar historial de eventos" checked={form.privacy.showHistory} onChange={(v) => set({ privacy: { ...form.privacy, showHistory: v } })} />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Redes</h2>
              <p className="mt-1 text-xs text-tea/45">Cada red tiene su interruptor. Se ocultan si están vacías o apagadas. WhatsApp requiere código de país (+507…).</p>
              <div className="mt-4 space-y-3">
                {REDES.map((r) => {
                  const red = form.redes[r.type]
                  return (
                    <div key={r.type} className="flex items-center gap-3">
                      <span className="w-20 flex-none font-mono text-[0.7rem] font-semibold uppercase tracking-wide text-caribbean">{r.label}</span>
                      <div className="relative flex-1">
                        {r.prefijo && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-tea/35">{r.prefijo}</span>}
                        <input value={red.value} onChange={(e) => setRed(r.type, { value: e.target.value })} placeholder={r.ph} className={`${inputCls} ${r.prefijo ? 'pl-8' : ''} ${red.visible ? '' : 'opacity-50'}`} />
                      </div>
                      <button type="button" onClick={() => setRed(r.type, { visible: !red.visible })} className={`h-6 w-11 flex-none rounded-full transition-colors ${red.visible ? 'bg-caribbean' : 'bg-tea/15'}`} aria-label={`Visibilidad ${r.label}`}>
                        <span className={`mt-0.5 block h-5 w-5 rounded-full bg-cream shadow transition-transform ${red.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={240}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Habilidades</h2>
                  <p className="mt-1 text-xs text-tea/45">Aparecen como barras de nivel en tu perfil (Básico → Experto).</p>
                </div>
                <Btn onClick={addSkill} tone="ghost">+ Añadir</Btn>
              </div>
              <div className="mt-4 space-y-3">
                {form.skills.length === 0 && <p className="text-sm text-tea/40">Aún no has añadido habilidades.</p>}
                {form.skills.map((s, i) => (
                  <div key={i} className="rounded-xl border border-tea/10 bg-jungle-deep/40 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.name ?? ''}
                        onChange={(e) => setSkill(i, { name: e.target.value })}
                        placeholder="Nombre de la habilidad (ej. Ilustración digital)"
                        className={`${inputCls} flex-1`}
                      />
                      <button type="button" onClick={() => removeSkill(i)} className="flex-none px-2 text-lg text-tea/40 transition-colors hover:text-candy" aria-label="Quitar habilidad">✕</button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="w-12 flex-none font-mono text-[0.65rem] uppercase tracking-wide text-tea/40">Nivel</span>
                      <select value={s.level} onChange={(e) => setSkill(i, { level: Number(e.target.value) })} className={`${inputCls} flex-1`}>
                        {NIVELES.map((n, idx) => (<option key={idx} value={idx + 1}>{idx + 1} · {n}</option>))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>

      {/* Zona de peligro: el cierre de sesión salió del menú lateral, donde se
          pulsaba por error al buscar la salida al sitio público. Aquí hay que
          bajar a propósito, y además se confirma. */}
      <Reveal className="mt-10">
        <div className="rounded-2xl border border-candy/30 bg-candy/5 p-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-candy">Zona de peligro</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-candy/15 pt-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-tea">Cerrar sesión</p>
              <p className="mt-0.5 text-xs leading-relaxed text-tea/50">
                Saldrás del panel en este dispositivo. Tus datos no se pierden.
              </p>
            </div>
            <Btn tone="candy" onClick={cerrarSesion}>Cerrar sesión</Btn>
          </div>
        </div>
      </Reveal>

    </>
  )
}
