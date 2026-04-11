import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
   plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // This tells Vite that @ translates to the /src folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
})