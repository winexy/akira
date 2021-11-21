import {initializeApp} from 'firebase/app'
import {getAuth, GoogleAuthProvider, signInWithRedirect} from 'firebase/auth'
import type {User as FirebaseUser} from 'firebase/auth'

const config = {
  apiKey: 'AIzaSyCBU8b6HX2K75H9ejUkjkLjvFN3y9-3QBg',
  authDomain: 'akira-wnx.firebaseapp.com',
  projectId: 'akira-wnx',
  storageBucket: 'akira-wnx.appspot.com',
  messagingSenderId: '252721708576',
  appId: '1:252721708576:web:48f406bc8ba729b021c645',
  measurementId: 'G-DFBDL3KN6W'
}

initializeApp(config)

export const auth = getAuth()
export {signInWithRedirect}
export const GoogleProvider = new GoogleAuthProvider()

export type User = FirebaseUser
