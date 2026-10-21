import type { Appointment, CreateAppointmentInput, AppointmentFilters, AvailableSlot } from './types'

// Ruta RELATIVA por defecto: en desarrollo la traduce el proxy de Vite (vite.config.ts) y en el
// contenedor la traduce nginx (nginx.conf). Así el bundle es portable y no hay CORS.
const API_URL = import.meta.env.VITE_API_URL || '/api'

interface ErrorResponse {
  error?: string
}

// The HTTP client comes in as a parameter (defaulting to the browser's fetch) so a test
// can hand it a double instead of going to the network. Components never pass it.
export type Fetcher = typeof fetch

export async function request<T>(
  path: string,
  options: RequestInit = {},
  fetcher: Fetcher = fetch,
): Promise<T> {
  const res = await fetcher(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  // The API returns { error: "..." } on error responses (see ErrorResponseDto
  // in the backend), so we unwrap it here once so components only need a
  // simple try/catch.
  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body: ErrorResponse = await res.json()
      if (body?.error) message = body.error
    } catch {
      // no JSON body, use the generic message
    }
    throw new Error(message)
  }

  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

// Pure: turns the admin panel's filters into the query string of GET /turnos.
// Empty filters are left out, so the API doesn't receive "status=" and reject it.
export function buildAppointmentsQuery(filters: AppointmentFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.date) params.set('date', filters.date)
  if (filters.serviceType) params.set('serviceType', filters.serviceType)
  if (filters.search) params.set('search', filters.search)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function listAppointments(filters: AppointmentFilters = {}, fetcher?: Fetcher): Promise<Appointment[]> {
  return request<Appointment[]>(`/turnos${buildAppointmentsQuery(filters)}`, {}, fetcher)
}

export function createAppointment(appointment: CreateAppointmentInput, fetcher?: Fetcher): Promise<Appointment> {
  return request<Appointment>('/turnos', {
    method: 'POST',
    body: JSON.stringify(appointment),
  }, fetcher)
}

export function listAvailableSlots(date: string, serviceType: string, fetcher?: Fetcher): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({ date, serviceType })
  return request<AvailableSlot[]>(`/available-slots?${params.toString()}`, {}, fetcher)
}

export function confirmAppointment(id: number, fetcher?: Fetcher): Promise<Appointment> {
  return request<Appointment>(`/turnos/${id}/confirmar`, { method: 'PUT' }, fetcher)
}

export function cancelAppointment(id: number, fetcher?: Fetcher): Promise<Appointment> {
  return request<Appointment>(`/turnos/${id}/cancelar`, { method: 'PUT' }, fetcher)
}

export function deleteAppointment(id: number, fetcher?: Fetcher): Promise<null> {
  return request<null>(`/turnos/${id}`, { method: 'DELETE' }, fetcher)
}
