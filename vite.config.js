import {defineConfig} from 'vite'
import copy from 'rollup-plugin-copy'
import pkg from './package.json'
import alias from './config/alias'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: alias.rollup
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [
    reactRefresh(),
    {
      ...copy({
        targets: [
          {
            src: 'config/netlify/_redirects',
            dest: 'dist'
          }
        ],
        verbose: true,
        hook: 'writeBundle'
      })
    }
  ]
})
