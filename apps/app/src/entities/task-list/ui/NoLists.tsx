import {InboxIcon} from '@heroicons/react/solid'
import * as React from 'react'

export const NoLists: React.FC = () => (
  <div className="p-4 flex justify-center items-center flex-col">
    <InboxIcon className="w-8 h-8" />
    <p className="mt-2 font-semibold text-xl">You have no lists yet</p>
  </div>
)
