import clsx from 'clsx'
import React from 'react'
import {useFirebaseAuth} from 'shared/lib/firebase'
import {Akira} from 'shared/ui/akira'
import {Button} from 'shared/ui/button'
import GoogleIcon from 'src/assets/icons/google.svg'

export const AuthPage: React.FC = () => {
  const {login} = useFirebaseAuth()

  return (
    <div className="bg-white dark:bg-dark-700 flex-1 flex-col flex justify-center items-center p-6">
      <h1
        className={clsx(
          'absolute top-0 mt-3',
          'text-sm font-bold text-center font-mono',
          'bg-gradient-to-r from-indigo-500 to-pink-600'
        )}
        style={{
          // @ts-expect-error
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        }}
      >
        akira.app
      </h1>
      <div className="mt-auto">
        <Akira className="w-36 h-36" />
      </div>
      <Button
        type="button"
        size="md"
        variant="outline"
        className="mt-auto w-full"
        onClick={login}
      >
        <img src={GoogleIcon} alt="" className="w-6 h-6 mr-2" />
        Authorize with Google
      </Button>
    </div>
  )
}
