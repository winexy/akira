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
import {auth, User} from 'shared/lib/firebase/auth'
import './app/index.css'
import noop from 'lodash/fp/noop'
import {TypeOfTag} from 'typescript'
import App from './app/App'
import {onDueDateChange} from './features/create-task/model/index'

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

const MockAuthStateChange: typeof auth.onAuthStateChanged = callback => {
  const user: User = {
    emailVerified: true,
    refreshToken: 'refreshToken',
    isAnonymous: false,
    tenantId: 'tenantId',
    getIdToken: noop as User['getIdToken'],
    delete: noop as User['delete'],
    getIdTokenResult: noop as User['getIdTokenResult'],
    reload: noop as User['reload'],
    toJSON: noop as User['toJSON'],
    displayName: 'John Doe',
    email: 'test@winexy.xyz',
    phoneNumber: null,
    photoURL: null,
    providerId: 'providerId',
    uid: 'oVcn0LQNDOZjLAF0UalkpWKlkVs2',
    providerData: [],
    metadata: {
      creationTime: String(Date.now()),
      lastSignInTime: String(Date.now())
    }
  }

  // @ts-expect-error
  callback(user)

  return () => {}
}

const onAuthStateChange = import.meta.env
  .VITE_USE_MOCK_AUTH_STATE_CHANGE_CALLBACK
  ? MockAuthStateChange
  : (...args: Parameters<typeof auth.onAuthStateChanged>) =>
      auth.onAuthStateChanged(...args)

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider
        onAuthSuccess={onAuthSuccess}
        onAuthStateChanged={onAuthStateChange}
      >
        <HotkeyProvider>
          <App />
        </HotkeyProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
