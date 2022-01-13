import React, {FC, ReactNode, useRef} from 'react'
import {useStore} from 'effector-react'
import {pomodoroModel} from 'entities/pomodoro'
import clsx from 'clsx'
import {Transition} from 'shared/ui/transition'

const Countdown: FC<{className: string}> = ({className}) => {
  const time = useStore(pomodoroModel.$time)

  return (
    <div
      className={clsx(
        'relative flex justify-center items-center',
        'w-48 h-48 rounded-full text-indigo-500 dark:text-white bg-white dark:bg-dark-600',
        'shadow transition ease-in duration-150',
        'focus:outline-none',
        className
      )}
    >
      <strong className="text-5xl flex justify-center items-center space-x-1">
        <span className="w-18 text-center">{time.minutes}</span>
        <span className="space-y-1">
          <span className="block w-2 h-2 rounded-full bg-indigo-500 dark:bg-white" />
          <span className="block w-2 h-2 rounded-full bg-indigo-500 dark:bg-white" />
        </span>
        <span className="w-18 text-center">{time.seconds}</span>
      </strong>
    </div>
  )
}

type RingProps = {
  className?: string
  radius: number
  stroke: string
  defs: ReactNode
  strokeWidth: number
  progress: number
}

const Ring: FC<RingProps> = props => {
  const {radius, strokeWidth, progress, className, stroke, defs} = props

  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg className={className} height={radius * 2} width={radius * 2}>
      <defs>{defs}</defs>
      <circle
        stroke={stroke}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{strokeDashoffset}}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

export const PomodoroTimer: FC = () => {
  const isFocusMode = useStore(pomodoroModel.$isFocusMode)
  const isBreakMode = useStore(pomodoroModel.$isBreakMode)
  const progress = useStore(pomodoroModel.$progress)
  const ref = useRef(null)

  return (
    <Transition.Fade appear nodeRef={ref}>
      <div ref={ref} className="relative flex items-center justify-center">
        <Ring
          className={clsx('z-10 pointer-events-none', {
            'text-red-300': isFocusMode,
            'text-green-300': isBreakMode
          })}
          radius={150}
          progress={progress}
          strokeWidth={20}
          stroke={isFocusMode ? 'url(#focus-gradient)' : 'url(#break-gradient)'}
          defs={
            <>
              <radialGradient
                id="break-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="50%" stopColor="#D1FAE5" />
                <stop offset="100%" stopColor="#6EE7B7" />
              </radialGradient>
              <radialGradient
                id="focus-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="50%" stopColor="#FEE2E2" />
                <stop offset="100%" stopColor="#F87171" />
              </radialGradient>
            </>
          }
        />
        <Countdown className="absolute z-10" />
        <div
          style={{width: 248, height: 248}}
          className="rounded-full shadow-inner absolute bg-gray-50 dark:bg-dark-500"
        />
      </div>
    </Transition.Fade>
  )
}
