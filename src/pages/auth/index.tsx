import React from 'react'
import {LoginIcon} from '@heroicons/react/solid'
import {useFirebaseAuth} from 'shared/lib/firebase'
import {Akira} from 'shared/ui/akira'
import {Button} from 'shared/ui/button'

export const AuthPage: React.FC = () => {
  const {login} = useFirebaseAuth()

  return (
    <div className="flex-1 flex-col flex justify-center items-center p-6">
      <div className="mt-auto">
        <Akira className="w-48 h-48" />
        <h2 className="text-white text-4xl font-bold text-center font-mono">
          Akira
        </h2>
      </div>
      <Button
        type="button"
        size="md"
        variant="indigo"
        className="mt-auto w-full"
        onClick={login}
      >
        <LoginIcon className="w-6 h-6 mr-2" />
        Sign in with Google
      </Button>
    </div>
  )
}