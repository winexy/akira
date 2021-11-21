import React, {createContext, useContext, useEffect, useState} from 'react'
import noop from 'lodash/fp/noop'
import {auth, GoogleProvider, User, signInWithRedirect} from './auth'

type AuthFunctionsT = {
  login(): void
  logout(): void
}

type AuthorizedT = {
  user: User
  isAuthenticated: true
}

type UnauthorizedT = {
  user: null
  isAuthenticated: false
}

type AuthStateT = AuthorizedT | UnauthorizedT
type ContextValueT = AuthFunctionsT & AuthStateT & {isLoading: boolean}

function login() {
  signInWithRedirect(auth, GoogleProvider)
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

type Props = {
  onAuthSuccess?(): void
}

export const FirebaseAuthProvider: React.FC<Props> = ({
  children,
  onAuthSuccess = noop
}) => {
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
        onAuthSuccess()
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })
  }, [setIsLoading, onAuthSuccess])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useFirebaseAuth() {
  return useContext(Context)
}
