import {initializeApp} from 'firebase/app'
import {getAuth, GoogleAuthProvider, signInWithRedirect} from 'firebase/auth'
import type {User as FirebaseUser} from 'firebase/auth'
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage
} from 'firebase/messaging'
import {config} from 'shared/config'
import {api} from 'shared/api'
import {exhaustiveCheck} from '../utils/index'

const firebaseConfig = {
  apiKey: 'AIzaSyCBU8b6HX2K75H9ejUkjkLjvFN3y9-3QBg',
  authDomain: 'akira-wnx.firebaseapp.com',
  projectId: 'akira-wnx',
  storageBucket: 'akira-wnx.appspot.com',
  messagingSenderId: '252721708576',
  appId: '1:252721708576:web:48f406bc8ba729b021c645',
  measurementId: 'G-DFBDL3KN6W'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth()
export {signInWithRedirect}
export const GoogleProvider = new GoogleAuthProvider()

export type User = FirebaseUser

const messaging = getMessaging(app)

export async function setupCloudMessaging() {
  const supported = await isSupported()

  if (!supported) {
    globalThis.console.log('Notification API is not supported')
    return
  }

  const permission = await Notification.requestPermission()

  switch (permission) {
    case 'granted': {
      const token = await getToken(messaging, {
        vapidKey: config.webPush.vapidKey
      })

      if (import.meta.env.DEV) {
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

onMessage(messaging, payload => {
  globalThis.console.log({payload})
})
