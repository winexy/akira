import React from 'react'
import ReactDOM from 'react-dom'
import {enableMapSet} from 'immer'
import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import {QueryClient, QueryClientProvider} from 'react-query'
import {akira} from 'shared/api/akira'
import {FirebaseAuthProvider, setupCloudMessaging} from 'shared/lib/firebase'
import {HotkeyProvider} from 'modules/hotkeys/HotKeyContext'
import {TaskQuery} from 'modules/tasks/config/index'
import {initAppThemeFx} from 'features/darkmode/model/index'
import './app/index.css'
import App from './app/App'

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
  queryClient.prefetchQuery(TaskQuery.MyDay(), akira.myday.tasks)
}

function onAuthSuccess() {
  prefetchQueries()
  setupCloudMessaging()
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
      <FirebaseAuthProvider onAuthSuccess={onAuthSuccess}>
        <HotkeyProvider>
          <App />
        </HotkeyProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
