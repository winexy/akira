import {FC, useRef, useEffect} from 'react'
import {createPortal} from 'react-dom'

type Props = {
  to: string
}

export const Portal: FC<Props> = ({children, to}) => {
  const el = useRef(document.createElement('div'))

  useEffect(() => {
    const portal = document.getElementById(to)

    if (portal === null) {
      throw new Error('[Portal] "to" prop must match to id of some element')
    }

    const root = el.current

    portal.appendChild(root)

    return () => {
      portal.removeChild(root)
    }
  }, [children, to])

  return createPortal(children, el.current)
}
