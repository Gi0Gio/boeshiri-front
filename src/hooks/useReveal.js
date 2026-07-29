import { useEffect, useRef } from 'react'

/**
 * Añade la clase `is-visible` cuando el elemento entra al viewport,
 * activando la transición definida en `.reveal` (index.css).
 */
export default function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
