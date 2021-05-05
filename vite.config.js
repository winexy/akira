import {defineConfig} from 'vite'
import copy from 'rollup-plugin-copy'
import pkg from './package.json'
import alias from './config/alias'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()], // Context values lost when refresh happens
  resolve: {
    alias: alias.rollup
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [
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
