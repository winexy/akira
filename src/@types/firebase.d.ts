import firebase from 'firebase/app'

declare global {
  export type DocRef<T> = firebase.firestore.DocumentReference<T>
  export type DocSnapshot<T> = firebase.firestore.DocumentSnapshot<T>
  export type QuerySnapshot<T> = firebase.firestore.QuerySnapshot<T>
  export type DocumentData = firebase.firestore.DocumentData
  export type FirestoreError = firebase.firestore.FirestoreError
  export type FirestoreDataConverter<
    T
  > = firebase.firestore.FirestoreDataConverter<T>
  export type CollectionReference<T> = firebase.firestore.CollectionReference<T>
}
