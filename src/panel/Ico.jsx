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
    compartir: (<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>),
    pluma: (<><path d="M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 3L8 18z" /><path d="M13.5 6.5l3 3" /></>),
    imagen: (<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></>),
    play: (<><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></>),
    nota: (<><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>),
    cerrar: (<path d="M6 6l12 12M18 6L6 18" />),
    formulario: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" /></>),
    reloj: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
    ir: (<path d="M5 12h14M13 6l6 6-6 6" />),
    enlace: (<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
    abajo: (<path d="M6 9l6 6 6-6" />),
    // Hoja de «Lo mío» en el riel: con el sol de la Junta, los dos sombreros de la selva.
    hoja: (<><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" /><path d="M5 19l8-8" /></>),
    // Sol de la Junta en el riel: el círculo con sus rayos, sin la cara del Dorace.
    sol: (<><circle cx="12" cy="12" r="4" /><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></>),
    grito: (<><path d="M3 11v2l13 5V6L3 11z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M7 13.5V18h3v-3.3" /></>),
  }
  return (
    <svg viewBox="0 0 24 24" className={`flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  )
}
