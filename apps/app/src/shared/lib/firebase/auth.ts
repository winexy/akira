import firebase from 'firebase/app'

const config = {
  apiKey: 'AIzaSyCBU8b6HX2K75H9ejUkjkLjvFN3y9-3QBg',
  authDomain: 'akira-wnx.firebaseapp.com',
  projectId: 'akira-wnx',
  storageBucket: 'akira-wnx.appspot.com',
  messagingSenderId: '252721708576',
  appId: '1:252721708576:web:48f406bc8ba729b021c645',
  measurementId: 'G-DFBDL3KN6W'
}

firebase.initializeApp(config)

export const auth = firebase.auth()
export const GoogleProvider = new firebase.auth.GoogleAuthProvider()

export type User = firebase.User
