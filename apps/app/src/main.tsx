import React from 'react'
import {createRoot} from 'react-dom/client'
import {enableMapSet} from 'immer'
import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import LogRocket from 'logrocket'
import {QueryClient, QueryClientProvider} from 'react-query'
import {akira} from 'shared/api/akira'
import {FirebaseAuthProvider, setupCloudMessaging} from 'shared/lib/firebase'
import type {User} from 'shared/lib/firebase'
import {HotkeyProvider} from 'shared/lib/hotkey'
import {taskConfig} from 'entities/task'
import {config} from 'shared/config'
import './app/index.css'
import App from './app/App'

enableMapSet()
enableSentry()
enableLogRocket()

function enableLogRocket() {
  if (config.env.prod) {
    LogRocket.init('bcxdki/akira')
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchIntervalInBackground: false,
    },
  },
})

async function prefetchQueries() {
  queryClient.prefetchQuery('tags', akira.tags.findAll)
  queryClient.prefetchQuery(taskConfig.queryKey.MyDay(), akira.myday.tasks)
}

function identifyUser(user: User) {
  if (config.env.dev) {
    return
  }

  const userTraits: Record<string, string> = {}

  if (user.email) {
    userTraits.email = user.email
  }

  LogRocket.identify(user.uid, userTraits)

  LogRocket.getSessionURL(sessionURL => {
    Sentry.configureScope(scope => {
      scope.setExtra('sessionURL', sessionURL)
    })
  })
}

function onAuthSuccess(user: User) {
  prefetchQueries()
  setupCloudMessaging()
  identifyUser(user)
}

function enableSentry() {
  if (config.env.prod) {
    Sentry.init({
      dsn: config.sentry.dsn,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
    })
  }
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider onAuthSuccess={onAuthSuccess}>
        <HotkeyProvider>
          <App />
        </HotkeyProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
