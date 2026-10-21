import { useEffect, useState } from 'react'
import CitizenView from './components/CitizenView'
import AdminView from './components/AdminView'
import ShieldIcon from './components/ShieldIcon'

type View = 'citizen' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('citizen')
  // El commit con el que se construyó este front (lo deja el Dockerfile en /version.txt).
  // Sirve para saber, mirando la pantalla, qué versión está corriendo: por ejemplo, después de
  // un rollback.
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    fetch('/version.txt')
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => {
        const commit = t?.trim()
        if (commit && /^[0-9a-f]{7,40}$|^local$/.test(commit)) setVersion(commit.slice(0, 7))
      })
      .catch(() => {})
  }, [])

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-header-brand">
            <ShieldIcon />
            <div>
              <p className="site-eyebrow">Ministerio del Interior · Dirección Nacional de Migraciones</p>
              <h1>Sistema de Turnos</h1>
            </div>
          </div>

          <div className="site-header-actions">
            <button
              type="button"
              className="link-button"
              onClick={() => setView(view === 'citizen' ? 'admin' : 'citizen')}
            >
              {view === 'citizen' ? 'Vista administrador' : 'Volver a vista ciudadano'}
            </button>
          </div>
        </div>
      </header>

      <div className="page-content">
        <main>
          {view === 'citizen' ? <CitizenView /> : <AdminView />}
        </main>
      </div>

      <footer className="site-footer">
        Atención presencial de lunes a viernes, de 9 a 16 h. Llegá diez minutos antes de tu turno con tu documento.
        {version && <span className="site-footer-version"> · versión {version}</span>}
      </footer>
    </div>
  )
}
