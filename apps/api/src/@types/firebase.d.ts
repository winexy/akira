import firebase from 'firebase-admin'

declare global {
  export type UserRecord = firebase.auth.UserRecord
}
