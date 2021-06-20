import React from 'react'
import {ShieldExclamationIcon} from '@heroicons/react/solid'
import {ViewTemplate} from '@views/ViewTemplate'
import {useHistory} from 'react-router'

export const WipView: React.FC = () => {
  const history = useHistory()

  return (
    <ViewTemplate className="flex-1 flex flex-col items-center justify-center">
      <ShieldExclamationIcon className="w-16 h-16 text-yellow-500" />
      <h2 className="mt-4 font-bold text-3xl text-gray-700">
        Work In Progress
      </h2>
      <button
        className="
          mt-8 px-6 py-2 
          border border-gray-700 
          text-gray-700 font-bold 
          rounded shadow-sm 
          transition ease-in duration-150
          active:text-white active:bg-gray-600 
          focus:outline-none
        "
        onClick={history.goBack}
      >
        Go back
      </button>
    </ViewTemplate>
  )
}
