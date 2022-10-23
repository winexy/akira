importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js')
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js',
)

const config = {
  apiKey: 'AIzaSyCBU8b6HX2K75H9ejUkjkLjvFN3y9-3QBg',
  authDomain: 'akira-wnx.firebaseapp.com',
  projectId: 'akira-wnx',
  storageBucket: 'akira-wnx.appspot.com',
  messagingSenderId: '252721708576',
  appId: '1:252721708576:web:48f406bc8ba729b021c645',
  measurementId: 'G-DFBDL3KN6W',
}

firebase.initializeApp(config)

const messaging = firebase.messaging()
