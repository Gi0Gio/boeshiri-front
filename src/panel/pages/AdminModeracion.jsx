import { PageHeader, Card, Chip, Reveal, DemoNote } from '../ui'

const cola = [
  { autor: 'Marco Vega', tipo: 'Noticia', titulo: 'Cobertura del jam de tambor', reporte: null, estado: 'Publicada' },
  { autor: 'Anónimo', tipo: 'Foto', titulo: 'Imagen sin contexto', reporte: 'Reportada por 2 miembros', estado: 'Publicada' },
  { autor: 'Lía Cruz', tipo: 'Artículo', titulo: 'Borrador fuera de lineamientos', reporte: 'Fuera de lineamientos', estado: 'Oculta' },
]
const estadoTono = { Publicada: 'caribbean', Oculta: 'terracotta' }

export default function AdminModeracion() {
  return (
    <>
      <PageHeader eyebrow="Administración" title="Moderación de publicaciones" description="Los miembros publican sin aprobación previa. La Junta y el Super Admin pueden ocultar o eliminar lo que no cumpla los lineamientos." />

      <div className="space-y-4">
        {cola.map((c, i) => (
          <Reveal key={c.titulo} delay={(i % 3) * 80}>
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="tea">{c.tipo}</Chip>
                  <Chip tone={estadoTono[c.estado]}>{c.estado}</Chip>
                  {c.reporte && <Chip tone="candy">⚠ {c.reporte}</Chip>}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-cream">{c.titulo}</h3>
                <p className="font-mono text-xs text-tea/45">por {c.autor}</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide">
                <button className="text-caribbean/80 hover:text-caribbean">Ver</button>
                <button className="text-caribbean/80 hover:text-caribbean">{c.estado === 'Publicada' ? 'Ocultar' : 'Mostrar'}</button>
                <button className="text-candy hover:underline">Eliminar</button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-tea/45">Un enlace a contenido oculto/eliminado muestra un mensaje genérico, sin exponer detalles internos.</p>
      <DemoNote />
    </>
  )
}
