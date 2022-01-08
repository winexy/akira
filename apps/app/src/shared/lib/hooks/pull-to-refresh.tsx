import React, {useEffect, useRef} from 'react'
import ReactDOMServer from 'react-dom/server'
import PullToRefresh, {PullToRefreshInstance} from 'pulltorefreshjs'
import {ArrowDownIcon} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'

const mockRefreshHandler = (ms: number) => () => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const waitUntil = (selector: string, onReady: () => void) => {
  const startTime = Date.now()
  let stop = false

  function WaitRec() {
    if (stop) {
      return
    }

    const now = Date.now()

    if (now - startTime >= 5_000) {
      throw new Error(
        `[waitUntil] element ${selector} is not ready after timeout`
      )
    }

    const node = document.querySelector(selector)

    if (node) {
      onReady()
      return
    }

    requestAnimationFrame(() => {
      WaitRec()
    })
  }

  WaitRec()

  return () => {
    stop = true
  }
}

export function usePullToRefresh({
  onRefresh,
  mainElement = 'body'
}: PullToRefresh.Options) {
  const ref = useRef<PullToRefreshInstance>()

  useEffect(() => {
    const stopWaiting = waitUntil(mainElement, () => {
      ref.current = PullToRefresh.init({
        mainElement,
        distReload: 30,
        iconArrow: ReactDOMServer.renderToString(
          <ArrowDownIcon className="w-4 h-4 mx-auto" />
        ),
        iconRefreshing: ReactDOMServer.renderToString(
          <div className="relative flex items-center justify-center">
            <span className="absolute ml-2 text-xs text-white font-semibold">
              Refreshing
            </span>
            <ContentLoader
              width="100%"
              height={30}
              backgroundColor="#3B82F6"
              foregroundColor="#60A5FA"
            >
              <rect rx="0" ry="0" x="0" y="0" width="100%" height="30" />
            </ContentLoader>
          </div>
        ),
        onRefresh
      })
    })

    return () => {
      stopWaiting()
      ref.current?.destroy()
    }
  }, [mainElement, onRefresh])

  return ref.current
}
