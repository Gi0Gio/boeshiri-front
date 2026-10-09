import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'

/** El catálogo cerrado de la API ([{ key, label }]). Lo comparten el picker y la Comunidad. */
export function useDisciplinas() {
  const { data } = useFetch(() => communityApi.disciplines().catch(() => []))
  return data ?? []
}

const TONOS = {
  // Panel (fondo oscuro)
  oscuro: {
    on: 'border-caribbean bg-caribbean text-jungle',
    off: 'border-tea/20 text-tea/80 hover:border-tea/40 hover:text-tea',
  },
  // Sitio público (fondo claro)
  claro: {
    on: 'border-rainforest bg-rainforest text-cream',
    off: 'border-rainforest/25 text-jungle/80 hover:border-rainforest/50 hover:text-jungle',
  },
}

/**
 * Elegir una o varias disciplinas del catálogo. Son botones con aria-pressed, no
 * casillas: así se ven como lo que filtran en la Comunidad.
 */
export default function DisciplinasPicker({ value, onChange, tono = 'oscuro', labelledBy }) {
  const catalogo = useDisciplinas()
  const t = TONOS[tono]
  const alternar = (key) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key])

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {catalogo.map((d) => {
        const activa = value.includes(d.key)
        return (
          <button key={d.key} type="button" aria-pressed={activa} onClick={() => alternar(d.key)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${activa ? t.on : t.off}`}>
            {d.label}
          </button>
        )
      })}
    </div>
  )
}
