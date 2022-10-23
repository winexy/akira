import React, {FC} from 'react'
import {useStore} from 'effector-react'
import {ReactQueryDevtools} from 'react-query/devtools'
import {reactQueryDebuggerModel} from './model'

export const ReactQueryDebugger: FC = () => {
  const showReactQueryDebugger = useStore(
    reactQueryDebuggerModel.$showReactQueryDebugger,
  )

  return showReactQueryDebugger ? <ReactQueryDevtools /> : null
}
