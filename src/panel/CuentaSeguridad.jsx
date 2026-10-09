import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Btn, inputCls, labelCls } from './ui'
import { authApi } from '../api/auth'
import { profileApi } from '../api/profile'
import { useToast } from '../components/Toast'
import { useSession } from '../auth/SessionContext'

/** Cambiar la contraseña con sesión iniciada. */
export function CambiarContrasena() {
  const toast = useToast()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetida, setRepetida] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (nueva !== repetida) {
      setError('Las dos contraseñas nuevas no coinciden.')
      return
    }
    setBusy(true)
    try {
      await authApi.changePassword(actual, nueva)
      setActual('')
      setNueva('')
      setRepetida('')
      toast.success('Contraseña cambiada. Cerramos tus sesiones en otros dispositivos.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Contraseña</h2>
      <p className="mt-1 text-xs text-tea/70">Al cambiarla se cierran tus sesiones en otros dispositivos.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="clave-actual" className={labelCls}>Contraseña actual</label>
          <input id="clave-actual" type="password" required autoComplete="current-password" value={actual}
            onChange={(e) => setActual(e.target.value)} className={`${inputCls} mt-1.5`} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="clave-nueva" className={labelCls}>Nueva</label>
            <input id="clave-nueva" type="password" required minLength={8} autoComplete="new-password" value={nueva}
              onChange={(e) => setNueva(e.target.value)} placeholder="Mínimo 8" className={`${inputCls} mt-1.5`} />
          </div>
          <div>
            <label htmlFor="clave-repetida" className={labelCls}>Repítela</label>
            <input id="clave-repetida" type="password" required minLength={8} autoComplete="new-password" value={repetida}
              onChange={(e) => setRepetida(e.target.value)} className={`${inputCls} mt-1.5`} />
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-candy">{error}</p>}
        <Btn type="submit" disabled={busy} className="disabled:opacity-60">{busy ? 'Guardando…' : 'Cambiar contraseña'}</Btn>
      </form>
    </Card>
  )
}

/** Descargar todo lo que el sistema guarda de ti (Ley 81). */
export function MisDatos() {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const descargar = async () => {
    setBusy(true)
    try {
      const datos = await profileApi.exportData()
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mis-datos-boesh-iri.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Tus datos</h2>
      <p className="mt-1 text-sm leading-relaxed text-tea/70">
        Descarga en un archivo todo lo que Boesh Irí guarda de ti: perfil, redes, grupos, publicaciones, anuncios, gritos y avisos.
      </p>
      <Btn tone="ghost" onClick={descargar} disabled={busy} className="mt-4 disabled:opacity-60">
        {busy ? 'Preparando…' : 'Descargar mis datos'}
      </Btn>
    </Card>
  )
}

/** Fila de la zona de peligro: eliminar la cuenta, con contraseña. */
export function EliminarCuenta() {
  const toast = useToast()
  const navigate = useNavigate()
  const { setUser } = useSession()
  const [abierto, setAbierto] = useState(false)
  const [clave, setClave] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const eliminar = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await profileApi.deleteAccount(clave)
      // La API ya borró las sesiones: aquí solo queda olvidar la local.
      await authApi.logout()
      setUser(null)
      toast.success('Tu cuenta fue eliminada.')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 border-t border-candy/15 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-tea">Eliminar mi cuenta</p>
          <p className="mt-0.5 text-xs leading-relaxed text-tea/70">
            Borra tus datos personales y retira lo que publicaste. No se puede deshacer.
          </p>
        </div>
        {!abierto && <Btn tone="candy" onClick={() => setAbierto(true)}>Eliminar cuenta</Btn>}
      </div>
      {abierto && (
        <form onSubmit={eliminar} className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-tea/80">
            Se borran tu perfil, foto, redes y avisos; tus publicaciones y anuncios dejan de verse y sales de tus grupos.
            Los registros que el colectivo debe conservar (finanzas, documentos) quedan a nombre de «Cuenta eliminada».
            Si quieres una copia, descarga antes tus datos.
          </p>
          <div>
            <label htmlFor="clave-eliminar" className={labelCls}>Escribe tu contraseña para confirmar</label>
            <input id="clave-eliminar" type="password" required autoComplete="current-password" value={clave}
              onChange={(e) => setClave(e.target.value)} className={`${inputCls} mt-1.5`} />
          </div>
          {error && <p role="alert" className="text-sm text-candy">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Btn type="submit" tone="candy" disabled={busy} className="disabled:opacity-60">{busy ? 'Eliminando…' : 'Eliminar definitivamente'}</Btn>
            <Btn type="button" tone="ghost" onClick={() => { setAbierto(false); setClave(''); setError('') }}>Cancelar</Btn>
          </div>
        </form>
      )}
    </div>
  )
}
