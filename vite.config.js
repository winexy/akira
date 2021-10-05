import {defineConfig} from 'vite'
import pkg from './package.json'
import alias from './config/alias'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: alias.rollup()
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [reactRefresh()]
})
