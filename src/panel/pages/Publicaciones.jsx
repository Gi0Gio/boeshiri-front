import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, DemoNote, RowActions, inputCls } from '../ui'
import { misPublicaciones, tiposPublicacion } from '../../data/panel'

const estadoTono = { Pública: 'caribbean', Oculta: 'gris' }

export default function Publicaciones() {
  const [creando, setCreando] = useState(false)
  const [tipo, setTipo] = useState('Artículo')

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Mis publicaciones"
        description="Publicas sin aprobación previa; la administración puede moderar."
        actions={<Btn tone="candy" onClick={() => setCreando((v) => !v)}>{creando ? 'Cerrar' : '+ Nueva publicación'}</Btn>}
      />

      {creando && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Nueva publicación</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-tea/45">Elige el tipo</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tiposPublicacion.map((t) => (
                <button key={t.tipo} type="button" onClick={() => setTipo(t.tipo)} className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${tipo === t.tipo ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15'}`}>
                  {t.tipo}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-lg border border-tea/10 bg-black/20 px-4 py-2 text-xs text-tea/60">{tiposPublicacion.find((t) => t.tipo === tipo)?.desc}</p>

            <div className="mt-5 space-y-4">
              <input className={inputCls} placeholder="Título" />
              {tipo === 'Artículo' || tipo === 'Noticia' ? (
                <>
                  <input className={inputCls} placeholder="Tags separados por coma" />
                  <textarea rows={4} className={`${inputCls} resize-none`} placeholder="Cuerpo del texto…" />
                  <input className={inputCls} placeholder="Links de referencia (hasta 3)" />
                  <div className="rounded-xl border border-dashed border-tea/20 p-6 text-center font-mono text-xs text-tea/45">Arrastra hasta 3 imágenes · JPG/PNG/WebP · máx 5 MB</div>
                </>
              ) : tipo === 'Foto' ? (
                <>
                  <input className={inputCls} placeholder="Descripción corta" />
                  <div className="rounded-xl border border-dashed border-tea/20 p-6 text-center font-mono text-xs text-tea/45">Sube tu imagen · JPG/PNG/WebP · máx 5 MB (sin YouTube)</div>
                </>
              ) : (
                <>
                  <input className={inputCls} placeholder="Descripción corta" />
                  <input className={inputCls} placeholder={tipo === 'Video' ? 'Enlace de YouTube' : 'Enlace externo (Spotify, YouTube, SoundCloud)'} />
                </>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-tea/70">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#00e6bc]" /> Publicar de forma pública
              </label>
              <Btn>Publicar</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {misPublicaciones.map((p, i) => (
          <Reveal key={p.titulo} delay={(i % 2) * 90}>
            <Card>
              <div className="flex items-center justify-between">
                <Chip tone="tea">{p.tipo}</Chip>
                <Chip tone={estadoTono[p.estado]}>{p.estado}</Chip>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.titulo}</h3>
              <p className="mt-2 font-mono text-xs text-tea/40">Creada {p.fecha}{p.edit !== '—' && ` · editada ${p.edit}`}</p>
              <div className="mt-4 border-t border-tea/8 pt-4">
                <RowActions items={['Editar', p.estado === 'Pública' ? 'Ocultar' : 'Mostrar', 'Compartir', 'Eliminar']} />
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
      <DemoNote />
    </>
  )
}
