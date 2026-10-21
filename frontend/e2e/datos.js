// Ayudas compartidas por las dos suites. Ninguna inventa respuestas: sólo fabrican datos únicos.

// Un sufijo que no se repite entre corridas: la hora en milisegundos, más un azar por si dos
// tests arrancan en el mismo milisegundo.
export function unico () {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`
}

// Un DNI de prueba único (sólo dígitos, entra en los 20 caracteres de la API).
export function dniUnico () {
  return unico().slice(-11)
}

function iso (d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Un día hábil al azar, entre 30 y 300 días adelante: lejos de los datos de verdad y casi
// imposible de compartir con otra corrida.
export function diaHabil () {
  const d = new Date()
  d.setDate(d.getDate() + 30 + Math.floor(Math.random() * 270))
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return iso(d)
}

// Un sábado al azar, también lejos: la grilla no habilita turnos ese día.
export function sabado () {
  const d = new Date()
  d.setDate(d.getDate() + 30 + Math.floor(Math.random() * 270))
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1)
  return iso(d)
}

// Un horario de la grilla (9:00 a 15:45, cada 15 minutos), al azar.
export function horario () {
  const slot = Math.floor(Math.random() * 28)
  const h = 9 + Math.floor(slot / 4)
  const m = (slot % 4) * 15
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
