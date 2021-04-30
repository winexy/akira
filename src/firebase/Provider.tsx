import React, {createContext, useContext, useEffect, useState} from 'react'
import {firebase, auth, GoogleProvider} from './firebase'

type AuthFunctionsT = {
  login(): void
  logout(): void
}

type AuthorizedT = {
  user: firebase.User
  isAuthenticated: true
}

type UnauthorizedT = {
  user: null
  isAuthenticated: false
}

type AuthStateT = AuthorizedT | UnauthorizedT
type ContextValueT = AuthFunctionsT & AuthStateT & {isLoading: boolean}

function login() {
  auth.signInWithRedirect(GoogleProvider)
}

function logout() {
  auth.signOut()
}

const defaultContextValue: ContextValueT = {
  user: null,
  login,
  logout,
  isAuthenticated: false,
  isLoading: false
}

const Context = createContext<ContextValueT>(defaultContextValue)

Context.displayName = 'FirebaseAuth'

export const FirebaseAuthProvider: React.FC = ({children}) => {
  const [user, setUser] = useState<ContextValueT['user']>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const value: ContextValueT =
    isAuthenticated && user
      ? {
          user,
          isAuthenticated,
          isLoading,
          login,
          logout
        }
      : {
          user: null,
          isAuthenticated: false,
          isLoading,
          login,
          logout
        }

  useEffect(() => {
    setIsLoading(true)
    return auth.onAuthStateChanged(firebaseUser => {
      setIsLoading(false)

      if (firebaseUser) {
        setUser(firebaseUser)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })
  }, [setIsLoading])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useFirebaseAuth() {
  return useContext(Context)
}
