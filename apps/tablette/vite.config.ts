import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
    allowedHosts: [
      'demo-service1.barberet.fr',
      'demo-service2.barberet.fr',
      'demo-service3.barberet.fr',
      'demo-service4.barberet.fr',
      'localhost'
    ],
  },
})
