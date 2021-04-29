import React from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {View} from '@views/View/View'
import {useSelector} from '@store/index'
import {selectTask} from '@store/tasks'
import {Header} from '@components/Header/Header'
import {ChevronLeftIcon} from '@heroicons/react/solid'

export const TaskView: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const task = useSelector(selectTask(id))

  return (
    <View
    // header={
    //   <Header>
    //     <button
    //       className={clsx(
    //         '-ml-2 p-2 pr-4',
    //         'flex justify-center items-center',
    //         'text-gray-700',
    //         'rounded-md',
    //         'transition ease-in duration-100',
    //         'active:bg-gray-100',
    //         'focus:outline-none'
    //       )}
    //     >
    //       <ChevronLeftIcon className="w-6 h-6 mr-2" />
    //       Back
    //     </button>
    //   </Header>
    // }
    >
      task {id}: {task?.title}
    </View>
  )
}
