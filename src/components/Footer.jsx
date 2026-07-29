import { Link } from 'react-router-dom'
import SolGuerraIcon from './SolGuerraIcon'
import logoUrl from '../assets/SVG/LOGOS/LOGO BOESH HORIZONTAL VERDE CARIBE.svg'

export default function Footer() {
  return (
    <footer className="bg-dorace-pattern relative overflow-hidden bg-jungle text-tea">

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <img src={logoUrl} alt="Boesh Irí" className="h-10 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-tea/70">
            Colectivo cultural independiente. Desempolvamos el pasado y lo sembramos con orgullo en
            el presente.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-caribbean">
            Explora
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link className="transition-colors hover:text-caribbean" to="/sobre">
                Sobre el colectivo
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-caribbean" to="/explorar">
                Eventos, blog y galería
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-caribbean" to="/postularme">
                Quiero ser parte
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-caribbean" to="/contacto">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-caribbean">
            Contacto
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-tea/80">
            {/* TODO: reemplazar con los datos reales del colectivo */}
            <li>
              <a className="transition-colors hover:text-caribbean" href="mailto:hola@boeshiri.org">
                hola@boeshiri.org
              </a>
            </li>
            <li>WhatsApp · próximamente</li>
            <li>Instagram · próximamente</li>
            <li>Chiriquí, Panamá</li>
          </ul>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 border-t border-tea/10 py-5 text-center text-xs tracking-wide text-tea/50">
        <SolGuerraIcon className="h-5 w-auto text-rainforest/60" />
        © {new Date().getFullYear()} Boesh Irí · Hecho con orgullo desde Chiriquí
      </div>
    </footer>
  )
}
