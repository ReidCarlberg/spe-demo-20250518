import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fluentui/react': resolve(__dirname, 'node_modules/@fluentui/react'),
      '@microsoft/sharepointembedded-copilotchat-react': resolve(__dirname, 
        'node_modules/@microsoft/sharepointembedded-copilotchat-react'),
    },
  },
  optimizeDeps: {
    include: ['@fluentui/react'],
    exclude: ['@microsoft/sharepointembedded-copilotchat-react'],
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.json', '.mjs'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/@microsoft\/sharepointembedded-copilotchat-react/, /node_modules/],
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
