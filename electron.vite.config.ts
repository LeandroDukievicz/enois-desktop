import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: { rollupOptions: { input: 'src/main/index.ts' } },
  },
  preload: {
    build: {
      externalizeDeps: false,
      rollupOptions: {
        input: 'src/preload/index.ts',
        output: { entryFileNames: 'index.cjs', format: 'cjs' },
        external: ['electron'],
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react(), tailwindcss()],
    build: { minify: true, rollupOptions: { input: 'src/renderer/index.html' } },
  },
})
