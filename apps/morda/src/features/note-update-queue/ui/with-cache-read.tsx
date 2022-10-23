import {useStore} from 'effector-react'
import React, {FC, useEffect} from 'react'
import {noteUpdateQueueModel} from '../model'

export function withCacheRead<
  Props extends {
    children?: React.ReactNode
  }
>(Component: FC<Props>): FC<Props> {
  return props => {
    const isCacheRead = useStore(noteUpdateQueueModel.$isCacheRead)

    useEffect(() => {
      if (!isCacheRead) {
        noteUpdateQueueModel.readCacheStorageFx()
      }
    }, [isCacheRead])

    if (isCacheRead) {
      return <Component {...props} />
    }

    return null
  }
}
