export const config = {
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    redirectURI: window.location.origin
  },
  firebase: {
    apiKey: 'AIzaSyASEq73SYkwUyM7Iwjg1pPw5v-RoHtOrX4',
    authDomain: 'akira-f76fc.firebaseapp.com',
    projectId: 'akira-f76fc',
    storageBucket: 'akira-f76fc.appspot.com',
    messagingSenderId: '270248885542',
    appId: '1:270248885542:web:111b2c3ebb17a0681515e7',
    measurementId: 'G-JLW0GXRVGY'
  }
}
