import firebase from 'firebase'
import {config} from '@config/app'

firebase.initializeApp(config.firebase)

export const auth = firebase.auth()
export const GoogleProvider = new firebase.auth.GoogleAuthProvider()

export type User = firebase.User
