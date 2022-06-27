import {getAuth, GoogleAuthProvider, signInWithRedirect} from 'firebase/auth'
import type {User as FirebaseUser} from 'firebase/auth'
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging'
import {config} from 'shared/config'
import {api} from 'shared/api'
import noop from 'lodash/noop'
import {exhaustiveCheck} from '../utils/index'
import {app} from './app'

type FirebaseAuth = ReturnType<typeof getAuth>

function getMockAuth(): FirebaseAuth {
  globalThis.console.info('[auth] Using mock auth')

  const user: User = {
    emailVerified: true,
    refreshToken: 'refreshToken',
    isAnonymous: false,
    tenantId: 'tenantId',
    async getIdToken() {
      return 'mock-id-token'
    },
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
      lastSignInTime: String(Date.now()),
    },
  }

  const currentUser: FirebaseAuth['currentUser'] = user
  const onAuthStateChanged: FirebaseAuth['onAuthStateChanged'] = callback => {
    // @ts-expect-error
    callback(user)
    return () => {}
  }

  return {
    currentUser,
    onAuthStateChanged,
  } as ReturnType<typeof getAuth>
}

export const auth = config.auth.use_mock ? getMockAuth() : getAuth()

export {signInWithRedirect}
export const GoogleProvider = new GoogleAuthProvider()

export type User = FirebaseUser

export async function setupCloudMessaging() {
  if (config.auth.use_mock) {
    globalThis.console.info('[auth] Skipping fcm service initialization')
    return
  }

  const messaging = getMessaging(app)

  const supported = await isSupported()

  if (!supported) {
    globalThis.console.log('Notification API is not supported')
    return
  }

  onMessage(messaging, payload => {
    globalThis.console.log({payload})
  })

  const permission = await Notification.requestPermission()

  switch (permission) {
    case 'granted': {
      const token = await getToken(messaging, {
        vapidKey: config.webPush.vapidKey,
      })

      if (config.env.dev) {
        globalThis.console.log({token})
      }

      await api.post('users/sync', {fcm_token: token})

      return
    }
    case 'denied':
    case 'default': {
      onPermissionDenied()
      return
    }
    default:
      exhaustiveCheck(permission)
  }
}

function onPermissionDenied() {
  globalThis.console.log('Notification permission is not granted')
}
