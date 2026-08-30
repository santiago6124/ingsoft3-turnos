import { useCallback, useEffect, useRef, useState } from 'react'
import { listAppointments } from '../api'
import AppointmentList from './AppointmentList'
import type { Appointment } from '../types'

/**
 * Cuántas veces se reintenta sola la carga antes de rendirse y dejarle el botón
 * al usuario, y cuánto se espera entre intentos.
 *
 * El caso real que esto cubre está en el issue #10: con `docker compose up -d`,
 * nginx sirve la SPA en menos de un segundo, pero el backend todavía está
 * esperando el healthcheck de la base y aplicando las migraciones de EF Core.
 * La primera llamada a /api/turnos falla, y unos segundos después funciona.
 */
const MAX_REINTENTOS = 4
const ESPERA_ENTRE_REINTENTOS_MS = 2000

interface AdminViewProps {
  /** Sólo para los tests: permite acelerar la espera entre reintentos. */
  esperaEntreReintentosMs?: number
}

export default function AdminView({
  esperaEntreReintentosMs = ESPERA_ENTRE_REINTENTOS_MS,
}: AdminViewProps = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * La corrección del issue #10: sin esto, una carga fallida deja `appointments`
   * en `[]` y la lista muestra "No hay turnos agendados", que es MENTIRA — sí
   * había turnos, no se pudieron traer. Hay que poder distinguir los dos casos.
   */
  const [cargaFallida, setCargaFallida] = useState(false)
  const [reintentos, setReintentos] = useState(0)

  // Evita que una respuesta lenta de una consulta vieja pise a una más nueva.
  const peticionVigente = useRef(0)

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(id)
  }, [searchInput])

  const loadAppointments = useCallback(async () => {
    const idPeticion = ++peticionVigente.current
    setLoading(true)
    setError(null)
    try {
      const data = await listAppointments({
        status: statusFilter || undefined,
        serviceType: serviceTypeFilter || undefined,
        search: search || undefined,
      })
      if (idPeticion !== peticionVigente.current) return
      setAppointments(data)
      setCargaFallida(false)
      setReintentos(0)
    } catch (err) {
      if (idPeticion !== peticionVigente.current) return
      setCargaFallida(true)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      if (idPeticion === peticionVigente.current) setLoading(false)
    }
  }, [statusFilter, serviceTypeFilter, search])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Reintento automático acotado, para el arranque en frío del backend.
  useEffect(() => {
    if (!cargaFallida || reintentos >= MAX_REINTENTOS) return
    const id = setTimeout(() => {
      setReintentos((n) => n + 1)
      loadAppointments()
    }, esperaEntreReintentosMs)
    return () => clearTimeout(id)
  }, [cargaFallida, reintentos, loadAppointments, esperaEntreReintentosMs])

  function reintentarAhora() {
    setReintentos(0)
    loadAppointments()
  }

  return (
    <div>
      {error && <p className="error global-error">{error}</p>}
      <AppointmentList
        appointments={appointments}
        loading={loading}
        cargaFallida={cargaFallida}
        reintentando={cargaFallida && reintentos < MAX_REINTENTOS}
        onReintentar={reintentarAhora}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        serviceTypeFilter={serviceTypeFilter}
        onServiceTypeFilterChange={setServiceTypeFilter}
        search={searchInput}
        onSearchChange={setSearchInput}
        onChanged={loadAppointments}
        onError={setError}
      />
    </div>
  )
}
