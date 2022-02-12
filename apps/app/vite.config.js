import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {readFileSync} from 'fs'
import pkg from './package.json'
import alias from './config/alias'

function GetServerConfig() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  return {
    open: true,
    https: {
      key: readFileSync('./cert/localhost-key.pem'),
      cert: readFileSync('./cert/localhost.pem')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: GetServerConfig(),
  resolve: {
    alias: alias.rollup()
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [react()]
})
