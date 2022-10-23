import React, {FC} from 'react'
import clsx from 'clsx'
import {Toggle} from 'shared/ui/toggle'
import {useStore} from 'effector-react'
import {reactQueryDebuggerModel} from './model'

type Props = {
  className?: string
}

export const ReactQueryDebuggerControl: FC<Props> = ({className}) => {
  const showReactQueryDebugger = useStore(
    reactQueryDebuggerModel.$showReactQueryDebugger,
  )

  return (
    <div className={clsx('flex px-4', className)}>
      <span className="mr-auto font-semibold text-lg">
        Show ReactQuery Debugger
      </span>
      <Toggle
        isChecked={showReactQueryDebugger}
        onChange={reactQueryDebuggerModel.toggleReactQueryDebugger}
      />
    </div>
  )
}
