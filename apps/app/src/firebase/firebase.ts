import firebase from 'firebase/app'
import {config} from '@config/app'
import 'firebase/analytics'
import 'firebase/auth'

firebase.initializeApp(config.firebase)

export {firebase}
export const auth = firebase.auth()
export const GoogleProvider = new firebase.auth.GoogleAuthProvider()
