/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo, /api se reenvía al backend .NET (dotnet run escucha en 5080).
    proxy: {
      '/api': { target: 'http://localhost:5080', changeOrigin: true },
    },
  },
  test: {
    // jsdom da un DOM de mentira para poder renderizar componentes sin navegador.
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // El build de producción no debe mirar los tests.
    // e2e/ es de Playwright (TP7): vitest no la toca, o explota con sus specs.
    exclude: [...configDefaults.exclude, 'dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      // json-summary: the totals file the pipeline turns into the table of the run's Summary.
      reporter: ['text', 'html', 'json-summary'],
      // What counts: the logic modules at the top of src/ (api, format, services...).
      // Components (.tsx) are UI and are left out on purpose; see decisiones.md, TP5.
      // A new .ts file in src/ enters the count by itself, with or without tests.
      include: ['src/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
      thresholds: { lines: 90, branches: 90 },
    },
  },
})
