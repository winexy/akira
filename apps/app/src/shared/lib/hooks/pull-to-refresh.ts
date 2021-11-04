import {useEffect, useRef} from 'react'
import PullToRefresh, {PullToRefreshInstance} from 'pulltorefreshjs'

export function usePullToRefresh({onRefresh}: PullToRefresh.Options) {
  const ref = useRef<PullToRefreshInstance>()

  useEffect(() => {
    ref.current = PullToRefresh.init({
      onRefresh
    })

    return () => {
      ref.current?.destroy()
    }
  }, [onRefresh])

  return ref.current
}
