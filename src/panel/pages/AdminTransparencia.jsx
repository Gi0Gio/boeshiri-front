import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, DemoNote, inputCls } from '../ui'
import { articulosOficiales } from '../../data/panel'

const estadoTono = { Publicado: 'caribbean', Oculto: 'gris' }

export default function AdminTransparencia() {
  const [creando, setCreando] = useState(false)

  return (
    <>
      <PageHeader
        eyebrow="Administración · Junta"
        title="Transparencia"
        description="Artículos oficiales de la Junta. Al publicarse, se notifica a cada integrante en su panel (correo en v2)."
        actions={<Btn tone="candy" onClick={() => setCreando((v) => !v)}>{creando ? 'Cerrar' : '+ Nuevo artículo'}</Btn>}
      />

      {creando && (
        <Reveal className="mb-6">
          <Card>
            <div className="space-y-4">
              <input className={inputCls} placeholder="Título" />
              <input className={inputCls} placeholder="Categoría (Informe, Aviso, Normativa…)" />
              <textarea rows={5} className={`${inputCls} resize-none`} placeholder="Cuerpo del artículo (texto)…" />
            </div>
            <div className="mt-4 flex justify-end"><Btn>Publicar y notificar</Btn></div>
          </Card>
        </Reveal>
      )}

      <div className="space-y-4">
        {articulosOficiales.map((a, i) => (
          <Reveal key={a.titulo} delay={(i % 3) * 80}>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="caribbean">{a.categoria}</Chip>
                  <Chip tone={estadoTono[a.estado]}>{a.estado}</Chip>
                  <span className="font-mono text-xs text-tea/40">{a.fecha}</span>
                </div>
                <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button className="text-caribbean/80 hover:text-caribbean">Editar</button>
                  <button className="text-caribbean/80 hover:text-caribbean">{a.estado === 'Publicado' ? 'Ocultar' : 'Mostrar'}</button>
                  <button className="text-candy hover:underline">Eliminar</button>
                </div>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-cream">{a.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tea/65">{a.cuerpo}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <DemoNote />
    </>
  )
}
