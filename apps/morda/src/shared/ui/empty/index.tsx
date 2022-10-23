import React, {FC, useRef} from 'react'
import clsx from 'clsx'
import EmptyImage from 'images/graphics/baloon-bottom.png'
import {Transition} from 'shared/ui/transition'

type Props = {
  message?: string
  className?: string
}

export const Empty: FC<Props> = ({
  className,
  message = 'No data',
  children,
}) => {
  const imgRef = useRef(null)

  return (
    <div
      className={clsx(
        'flex flex-col justify-center items-center pt-12',
        className,
      )}
    >
      <Transition.Scale nodeRef={imgRef} appear scaleFrom={0.5}>
        <img
          ref={imgRef}
          src={EmptyImage}
          alt="speech baloon"
          className="h-32"
        />
      </Transition.Scale>
      <h2 className="mt-4 font-bold text-2xl text-center">{message}</h2>
      {children}
    </div>
  )
}
