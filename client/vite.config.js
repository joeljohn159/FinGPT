// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures relative paths are used during production build.
  build: {
    outDir: 'dist', // Default output directory is 'dist'
    rollupOptions: {
      input: '/index.html', // Make sure the entry is the index.html file
    },
  },
});