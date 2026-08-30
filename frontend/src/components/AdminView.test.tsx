import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminView from './AdminView'
import { listAppointments } from '../api'
import type { Appointment } from '../types'

// El módulo de API se reemplaza por uno falso: estos tests son sobre el
// comportamiento de la vista, no sobre la red.
vi.mock('../api', () => ({
  listAppointments: vi.fn(),
  confirmAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
}))

const listAppointmentsMock = vi.mocked(listAppointments)

const UN_TURNO: Appointment[] = [
  {
    id: 1,
    citizenName: 'Ana Pérez',
    nationalId: '12345678',
    scheduledAt: '2026-09-02T09:00:00',
    serviceType: 'Pasaporte',
    status: 'Pending',
    createdAt: '2026-08-30T12:00:00',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminView — regresión del issue #10', () => {
  it('NO dice "no hay turnos" cuando la carga falló', async () => {
    // Este es el bug: con la lista vacía por un error, la app afirmaba que no
    // había turnos agendados. No lo sabe — no pudo consultarlos.
    listAppointmentsMock.mockRejectedValue(new Error('Failed to fetch'))

    render(<AdminView esperaEntreReintentosMs={50} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no se pudieron cargar los turnos/i,
    )
    expect(screen.queryByText(/no hay turnos agendados/i)).not.toBeInTheDocument()
  })

  it('sí dice "no hay turnos" cuando la carga funcionó y vino vacía', async () => {
    // La contracara: con cero turnos de verdad, el mensaje tiene que aparecer.
    listAppointmentsMock.mockResolvedValue([])

    render(<AdminView esperaEntreReintentosMs={50} />)

    expect(await screen.findByText(/no hay turnos agendados/i)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reintenta solo y muestra la lista cuando el backend termina de arrancar', async () => {
    // El escenario real del issue: la primera llamada falla porque el backend
    // todavía está aplicando migraciones; la siguiente ya funciona.
    listAppointmentsMock
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValue(UN_TURNO)

    render(<AdminView esperaEntreReintentosMs={50} />)

    // Primero avisa del problema...
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    // ...y sin que el usuario toque nada, aparece el turno.
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('el botón "Reintentar ahora" vuelve a consultar la API', async () => {
    listAppointmentsMock.mockRejectedValue(new Error('Failed to fetch'))
    // Sin reintento automático (espera enorme), para aislar el botón.
    render(<AdminView esperaEntreReintentosMs={1_000_000} />)

    await screen.findByRole('alert')
    const llamadasIniciales = listAppointmentsMock.mock.calls.length

    listAppointmentsMock.mockResolvedValue(UN_TURNO)
    await userEvent.click(screen.getByRole('button', { name: /reintentar ahora/i }))

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    expect(listAppointmentsMock.mock.calls.length).toBeGreaterThan(llamadasIniciales)
  })
})
