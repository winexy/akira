export const config = {
  app: {
    // @ts-ignore
    version: __VERSION__
  },
  firebase: {
    apiKey: 'AIzaSyCBU8b6HX2K75H9ejUkjkLjvFN3y9-3QBg',
    authDomain: 'akira-wnx.firebaseapp.com',
    projectId: 'akira-wnx',
    storageBucket: 'akira-wnx.appspot.com',
    messagingSenderId: '252721708576',
    appId: '1:252721708576:web:48f406bc8ba729b021c645',
    measurementId: 'G-DFBDL3KN6W'
  },
  api: {
    url: import.meta.env.VITE_AKIRA_API
  }
}

if (import.meta.env.DEV) {
  config.api.url = config.api.url.replace('localhost', window.location.hostname)
}