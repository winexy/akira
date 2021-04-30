import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {FirebaseAuthProvider} from '@/firebase/index'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAuthProvider>
      <App />
    </FirebaseAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
