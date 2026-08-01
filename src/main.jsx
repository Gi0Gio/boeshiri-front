import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Marketplace from './pages/Marketplace'
import MarketplaceDetalle from './pages/MarketplaceDetalle'
import Contacto from './pages/Contacto'
import Postularme from './pages/Postularme'
import VerificarCorreo from './pages/VerificarCorreo'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Panel autenticado
import PanelLayout from './panel/PanelLayout'
import Dashboard from './panel/pages/Dashboard'
import MiPerfil from './panel/pages/MiPerfil'
import Publicaciones from './panel/pages/Publicaciones'
import Grupos from './panel/pages/Grupos'
import GrupoDetalle from './panel/pages/GrupoDetalle'
import Documentos from './panel/pages/Documentos'
import MiMarketplace from './panel/pages/MiMarketplace'
import AdminMiembros from './panel/pages/AdminMiembros'
import AdminComisiones from './panel/pages/AdminComisiones'
import AdminEventos from './panel/pages/AdminEventos'
import AdminModeracion from './panel/pages/AdminModeracion'
import AdminFinanzas from './panel/pages/AdminFinanzas'
import AdminTransparencia from './panel/pages/AdminTransparencia'
import EspacioJunta from './panel/pages/EspacioJunta'
import SuperRoles from './panel/pages/SuperRoles'
import SuperAuditoria from './panel/pages/SuperAuditoria'
import SuperArchivos from './panel/pages/SuperArchivos'

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
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:id" element={<MarketplaceDetalle />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="postularme" element={<Postularme />} />
            <Route path="verificar" element={<VerificarCorreo />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Login (sin layout público) */}
          <Route path="login" element={<Login />} />

          {/* Panel autenticado */}
          <Route path="panel" element={<PanelLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="perfil" element={<MiPerfil />} />
            <Route path="publicaciones" element={<Publicaciones />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/:id" element={<GrupoDetalle />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="marketplace" element={<MiMarketplace />} />
            <Route path="admin/miembros" element={<AdminMiembros />} />
            <Route path="admin/comisiones" element={<AdminComisiones />} />
            <Route path="admin/eventos" element={<AdminEventos />} />
            <Route path="admin/moderacion" element={<AdminModeracion />} />
            <Route path="admin/finanzas" element={<AdminFinanzas />} />
            <Route path="admin/transparencia" element={<AdminTransparencia />} />
            <Route path="admin/junta" element={<EspacioJunta />} />
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
