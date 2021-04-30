import React from 'react'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import {Auth0Provider} from '@auth0/auth0-react'
import {config} from '@config/app'
import './index.css'
import App from './App'

import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/database'

firebase.initializeApp(config.firebase)

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={config.auth0.domain}
      clientId={config.auth0.clientId}
      redirectUri={config.auth0.redirectURI}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
