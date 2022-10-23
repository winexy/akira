import React from 'react'
import {ShieldExclamationIcon} from '@heroicons/react/solid'
import {PageView} from 'shared/ui/page-view'
import {useNavigate} from 'react-router'
import {Button} from 'shared/ui/button'

const WipPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <PageView className="flex-1 flex flex-col items-center justify-center">
      <ShieldExclamationIcon className="w-16 h-16 text-amber-500" />
      <h2 className="mt-4 font-bold text-3xl text-gray-700">
        Work In Progress
      </h2>
      <Button
        size="md"
        variant="outline"
        className="mt-8"
        onClick={() => navigate(-1)}
      >
        Go back
      </Button>
    </PageView>
  )
}

export default WipPage
