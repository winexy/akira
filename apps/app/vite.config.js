import {defineConfig} from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import path from 'path'

const srcPath = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(srcPath, 'components'),
      '@hooks': path.resolve(srcPath, 'hooks'),
      '@views': path.resolve(srcPath, 'views')
    }
  }
})
