import React from 'react'
import ReactDOM from 'react-dom'
import {enableMapSet} from 'immer'
import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import {QueryClient, QueryClientProvider} from 'react-query'
import './index.css'
import {akira} from '@lib/akira'
import {FirebaseAuthProvider} from '@/firebase'
import App from './App'
import {HotkeyProvider} from '../modules/hotkeys/HotKeyContext'
import {TaskQuery} from '../modules/tasks/config/index'
import {initAppThemeFx} from '../modules/preferences/darkmode/index'

enableMapSet()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchIntervalInBackground: false
    }
  }
})

async function prefetchQueries() {
  queryClient.prefetchQuery('tags', akira.tags.findAll)
  await queryClient.prefetchQuery(TaskQuery.MyDay(), akira.myday.tasks)
}

initAppThemeFx()

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0
  })
}

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider onAuthSuccess={prefetchQueries}>
        <HotkeyProvider>
          <App />
        </HotkeyProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
