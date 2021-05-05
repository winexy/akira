import firebase from 'firebase/app'
import {config} from '@config/app'
import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp(config.firebase)

export {firebase}

export const auth = firebase.auth()
export const GoogleProvider = new firebase.auth.GoogleAuthProvider()

export const db = firebase.firestore()

export const {arrayUnion, arrayRemove} = firebase.firestore.FieldValue
