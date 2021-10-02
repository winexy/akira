import React from 'react'
import {ShieldExclamationIcon} from '@heroicons/react/solid'
import {MainView} from '@views/MainView'
import {useHistory} from 'react-router'
import {Button} from '@shared/ui/button'

const WipView: React.FC = () => {
  const history = useHistory()

  return (
    <MainView className="flex-1 flex flex-col items-center justify-center">
      <ShieldExclamationIcon className="w-16 h-16 text-yellow-500" />
      <h2 className="mt-4 font-bold text-3xl text-gray-700">
        Work In Progress
      </h2>
      <Button
        size="md"
        variant="outline"
        className="mt-8"
        onClick={history.goBack}
      >
        Go back
      </Button>
    </MainView>
  )
}

export default WipView
