import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Sin `apiDevServer`: este proyecto no tiene carpeta /api. No hay formulario ni
// newsletter que necesiten un endpoint, así que el dev server es solo Vite.

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
