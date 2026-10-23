import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './App.css'

// Sentry (TP9): errores del navegador, demoras de carga y visitas.
// El DSN va escrito a propósito: sólo sirve para ENVIAR eventos a este proyecto, no para leerlos, y
// viaja de todos modos en el JavaScript que baja cualquier navegador. No es una clave.
// environment = el sitio que lo mandó, para separar PROD de QA (donde corren las e2e) y de localhost.
Sentry.init({
  dsn: 'https://64949973ed2c397f367cff4035ac2496@o4512284939124736.ingest.us.sentry.io/4512284944760832',
  environment: window.location.hostname,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root en index.html')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
