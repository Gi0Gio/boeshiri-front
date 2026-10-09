import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App'
import { SessionProvider } from './auth/SessionContext'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'

// Público
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Explorar from './pages/Explorar'
import PublicacionDetalle from './pages/PublicacionDetalle'
import Perfil from './pages/Perfil'
import Comunidad from './pages/Comunidad'
import Eventos from './pages/Eventos'
import EventoDetalle from './pages/EventoDetalle'
import Marketplace from './pages/Marketplace'
import MarketplaceDetalle from './pages/MarketplaceDetalle'
import Contacto from './pages/Contacto'
import Postularme from './pages/Postularme'
import VerificarCorreo from './pages/VerificarCorreo'
import Login from './pages/Login'
import { Recuperar, Restablecer } from './pages/Recuperar'
import NotFound from './pages/NotFound'

// Panel autenticado
import PanelLayout from './panel/PanelLayout'
import Dashboard from './panel/pages/Dashboard'
import MiPerfil from './panel/pages/MiPerfil'
import Publicaciones from './panel/pages/Publicaciones'
import Publicar from './panel/pages/Publicar'
import Convocatoria from './pages/Convocatoria'
import AdminConvocatorias from './panel/pages/AdminConvocatorias'
import EventoEditor from './panel/pages/EventoEditor'
import ConvocatoriaEditor from './panel/pages/ConvocatoriaEditor'
import ConvocatoriaDetalle from './panel/pages/ConvocatoriaDetalle'
import Grupos from './panel/pages/Grupos'
import GrupoDetalle from './panel/pages/GrupoDetalle'
import EquipoDetalle from './panel/pages/EquipoDetalle'
import Documentos from './panel/pages/Documentos'
import MiMarketplace from './panel/pages/MiMarketplace'
import AdminMiembros from './panel/pages/AdminMiembros'
import AdminComisiones from './panel/pages/AdminComisiones'
import AdminEventos from './panel/pages/AdminEventos'
import AdminModeracion from './panel/pages/AdminModeracion'
import AdminFinanzas from './panel/pages/AdminFinanzas'
import AdminTransparencia from './panel/pages/AdminTransparencia'
import SuperRoles from './panel/pages/SuperRoles'
import SuperAuditoria from './panel/pages/SuperAuditoria'
import SuperArchivos from './panel/pages/SuperArchivos'
import Avisos from './panel/pages/Avisos'
import JuntaPendientes from './panel/pages/JuntaPendientes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <ToastProvider>
       <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          {/* Sitio público */}
          <Route element={<App />}>
            <Route index element={<Home />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="explorar" element={<Explorar />} />
            <Route path="publicaciones/:id" element={<PublicacionDetalle />} />
            <Route path="perfil/:slug" element={<Perfil />} />
            <Route path="comunidad" element={<Comunidad />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="eventos/:id" element={<EventoDetalle />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:id" element={<MarketplaceDetalle />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="convocatorias/:id" element={<Convocatoria />} />
            <Route path="postularme" element={<Postularme />} />
            <Route path="verificar" element={<VerificarCorreo />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Login (sin layout público) */}
          <Route path="login" element={<Login />} />
          <Route path="recuperar" element={<Recuperar />} />
          <Route path="restablecer" element={<Restablecer />} />

          {/* Panel autenticado */}
          <Route path="panel" element={<PanelLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="perfil" element={<MiPerfil />} />
            <Route path="publicaciones" element={<Publicaciones />} />
            <Route path="publicar" element={<Publicar />} />
            <Route path="publicar/:id" element={<Publicar />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/:id" element={<GrupoDetalle />} />
            <Route path="grupos/equipos/:id" element={<EquipoDetalle />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="marketplace" element={<MiMarketplace />} />
            <Route path="avisos" element={<Avisos />} />
            <Route path="admin" element={<JuntaPendientes />} />
            <Route path="admin/miembros" element={<AdminMiembros />} />
            <Route path="admin/comisiones" element={<AdminComisiones />} />
            <Route path="admin/eventos" element={<AdminEventos />} />
            <Route path="admin/eventos/nuevo" element={<EventoEditor />} />
            <Route path="admin/eventos/:id/editar" element={<EventoEditor />} />
            <Route path="admin/moderacion" element={<AdminModeracion />} />
            <Route path="admin/finanzas" element={<AdminFinanzas />} />
            <Route path="admin/transparencia" element={<AdminTransparencia />} />
            <Route path="admin/convocatorias" element={<AdminConvocatorias />} />
            <Route path="admin/convocatorias/nueva" element={<ConvocatoriaEditor />} />
            <Route path="admin/convocatorias/:id" element={<ConvocatoriaDetalle />} />
            <Route path="admin/convocatorias/:id/editar" element={<ConvocatoriaEditor />} />
            {/* «Espacio Junta» repetía el menú y enlazaba a la biblioteca: la ruta vieja lleva a esa biblioteca. */}
            <Route path="admin/junta" element={<Navigate to="/panel/documentos#junta" replace />} />
            <Route path="super/roles" element={<SuperRoles />} />
            <Route path="super/auditoria" element={<SuperAuditoria />} />
            <Route path="super/archivos" element={<SuperArchivos />} />
          </Route>
        </Routes>
      </BrowserRouter>
       </ConfirmProvider>
      </ToastProvider>
    </SessionProvider>
  </StrictMode>,
)
