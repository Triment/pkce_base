import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import heroui from '@heroui/react'
export default defineConfig({
  plugins: [
    tailwindcss()
  ],
})