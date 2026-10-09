/**
 * Íconos del panel: line-art de un solo trazo, todos del mismo grosor. Las
 * flechas, el «+» y el desplegable también salen de aquí, no de caracteres
 * Unicode, para que pesen y se alineen igual que los de la navegación.
 */
export default function Ico({ name, className = 'h-[22px] w-[22px]' }) {
  const p = {
    home: (<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-4.5 5.5-4.5S14.5 16 14.5 19" /><path d="M16 6a3 3 0 0 1 .3 5.9" /><path d="M17 14.6c1.9.6 3.3 2.2 3.3 4.4" /></>),
    plus: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>),
    bell: (<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>),
    inbox: (<><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1.5 2.5h5L16 13h5" /></>),
    grid: (<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
    calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>),
    dots: (<><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>),
    shield: (<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />),
    dollar: (<><path d="M12 3v18" /><path d="M16.5 6.5c-.8-1.3-2.6-2-4.5-2s-4 1-4 3 2 2.8 4 3 4 1 4 3-2 3-4 3-3.7-.7-4.5-2" /></>),
    megaphone: (<><path d="M3 11v2l13 5V6L3 11z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M7 13.5V18h3v-3.3" /></>),
    key: (<><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8M16 16l2-2M18 18l2-2" /></>),
    list: (<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />),
    cloud: (<path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.96" />),
    user: (<><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5" /></>),
    cart: (<><circle cx="9" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /><path d="M3 4h2l2.4 12h9.8l1.9-8H6.4" /></>),
    folder: (<path d="M3 6h6l2 2h10v11H3z" />),
    mas: (<path d="M12 5v14M5 12h14" />),
    atras: (<path d="M19 12H5M11 6l-6 6 6 6" />),
    ir: (<path d="M5 12h14M13 6l6 6-6 6" />),
    enlace: (<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
    abajo: (<path d="M6 9l6 6 6-6" />),
    grito: (<><path d="M3 11v2l13 5V6L3 11z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M7 13.5V18h3v-3.3" /></>),
  }
  return (
    <svg viewBox="0 0 24 24" className={`flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  )
}
