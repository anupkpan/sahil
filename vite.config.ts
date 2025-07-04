import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Ensures correct relative paths in built index.html
  build: {
    outDir: 'dist' // ✅ Output directory for Vercel
  }
});
