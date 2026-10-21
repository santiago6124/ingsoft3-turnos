import { defineConfig } from '@playwright/test'

// Dos suites, una herramienta (TP7):
//   e2e/api.spec.js    → integración: pedidos HTTP a la API de QA, sin navegador (API_BASE_URL).
//   e2e/turnos.spec.js → e2e: Chromium usando el front de QA como una persona (E2E_BASE_URL).
// Cada job del pipeline corre su archivo por nombre.
export default defineConfig({
  testDir: './e2e',
  // El cold start del free tier se absorbe con TIEMPOS, no salteando tests: el smoke del job
  // anterior ya despertó QA, y estos topes cubren un servicio lento sin colgarse para siempre.
  timeout: 60_000,                 // tope de cada test
  expect: { timeout: 15_000 },     // tope de cada aserción (el default es 5 s)
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',       // la traza se graba en el reintento de un fallo
    screenshot: 'only-on-failure',
  },
  // Un reintento: absorbe una demora suelta de la red. Si un test pasa recién ahí, el reporte lo
  // marca «flaky» con la corrida en verde: hay que mirarlo igual.
  retries: 1,
  workers: 1,                      // QA es uno solo: las pruebas no se pisan entre ellas
  reporter: [['html', { open: 'never' }], ['list']],
})
