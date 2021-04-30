import {defineConfig} from 'vite'
// import reactRefresh from '@vitejs/plugin-react-refresh'
import alias from './config/alias'

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [reactRefresh()], // Context values lost when refresh happens
  resolve: {
    alias: alias.rollup
  }
})
