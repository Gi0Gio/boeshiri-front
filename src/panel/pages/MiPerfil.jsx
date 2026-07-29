import { useState } from 'react'
import { PageHeader, Card, Toggle, Btn, Chip, Reveal, DemoNote, inputCls, labelCls } from '../ui'
import { usuarioActual } from '../../data/panel'

const etiquetasDisponibles = ['Muralista', 'Pintora', 'Artista digital', 'Gestora cultural']

const redesIniciales = [
  { id: 'instagram', label: 'Instagram', prefijo: '@', valor: 'ana.murales', visible: true },
  { id: 'discord', label: 'Discord', prefijo: '', valor: 'ana#2043', visible: true },
  { id: 'whatsapp', label: 'WhatsApp', prefijo: '+507 ', valor: '6123-4567', visible: false },
  { id: 'tiktok', label: 'TikTok', prefijo: '@', valor: 'ana.art', visible: false },
  { id: 'mail', label: 'Mail público', prefijo: '', valor: 'hola@analopez.art', visible: true },
]

export default function MiPerfil() {
  const [privacidad, setPrivacidad] = useState({ telefono: false, correo: false, whatsapp: false, comisiones: true, historial: true })
  const [redes, setRedes] = useState(redesIniciales)
  const toggleRed = (id) => setRedes((rs) => rs.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)))

  return (
    <>
      <PageHeader eyebrow="Miembro" title="Mi perfil" description="Tu perfil funciona como portafolio público. Tú controlas qué se muestra." actions={<Btn>Guardar cambios</Btn>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl font-display text-2xl font-semibold text-jungle" style={{ background: `linear-gradient(150deg, ${usuarioActual.colores[0]}, ${usuarioActual.colores[1]})` }}>
                {usuarioActual.iniciales}
              </div>
              <div>
                <Btn tone="ghost">Cambiar foto</Btn>
                <p className="mt-2 font-mono text-xs text-tea/40">JPG/PNG/WebP · máx 5 MB</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={`${inputCls} mt-1.5`} defaultValue={usuarioActual.nombre} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={3} className={`${inputCls} mt-1.5 resize-none`} defaultValue="Traduzco símbolos ancestrales a muros de gran escala. Cofundadora de Boesh Irí." />
              </div>
              <div>
                <label className={labelCls}>Etiquetas (cosméticas)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {etiquetasDisponibles.map((e, i) => <Chip key={e} tone={i === 0 ? 'caribbean' : 'gris'}>{e}</Chip>)}
                  <button className="rounded-full border border-dashed border-tea/25 px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-tea/60">+ añadir</button>
                </div>
                <p className="mt-2 text-xs text-tea/40">Describen tu trabajo; no otorgan permisos.</p>
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
                <Toggle label="Mostrar teléfono" checked={privacidad.telefono} onChange={(v) => setPrivacidad((p) => ({ ...p, telefono: v }))} />
                <Toggle label="Mostrar correo personal" checked={privacidad.correo} onChange={(v) => setPrivacidad((p) => ({ ...p, correo: v }))} />
                <Toggle label="Mostrar WhatsApp" checked={privacidad.whatsapp} onChange={(v) => setPrivacidad((p) => ({ ...p, whatsapp: v }))} />
                <Toggle label="Mostrar comisiones / equipos" checked={privacidad.comisiones} onChange={(v) => setPrivacidad((p) => ({ ...p, comisiones: v }))} />
                <Toggle label="Mostrar historial de eventos" checked={privacidad.historial} onChange={(v) => setPrivacidad((p) => ({ ...p, historial: v }))} />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Redes</h2>
              <p className="mt-1 text-xs text-tea/45">Cada red tiene su interruptor. Se ocultan si están vacías o apagadas.</p>
              <div className="mt-4 space-y-3">
                {redes.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="w-24 flex-none font-mono text-[0.7rem] font-semibold uppercase tracking-wide text-caribbean">{r.label}</span>
                    <div className="relative flex-1">
                      {r.prefijo && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-tea/35">{r.prefijo}</span>}
                      <input defaultValue={r.valor} className={`${inputCls} ${r.prefijo ? 'pl-12' : ''} ${r.visible ? '' : 'opacity-50'}`} />
                    </div>
                    <button type="button" onClick={() => toggleRed(r.id)} className={`h-6 w-11 flex-none rounded-full transition-colors ${r.visible ? 'bg-caribbean' : 'bg-tea/15'}`} aria-label={`Visibilidad ${r.label}`}>
                      <span className={`mt-0.5 block h-5 w-5 rounded-full bg-cream shadow transition-transform ${r.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
      <DemoNote />
    </>
  )
}
