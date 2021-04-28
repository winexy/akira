import React, {
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
  FormEventHandler,
  useEffect
} from 'react'
import isEmpty from 'lodash/fp/isEmpty'
import {ChevronLeftIcon, XCircleIcon, XIcon} from '@heroicons/react/solid'
import clsx from 'clsx'

type TaskFormProps = {
  title: string
  onTitleChange(title: string): void
  onSubmit(): void
  onVisibilityChange(isVisible: boolean): void
}

export type TaskFormRef = {
  show(): void
}

export const TaskForm = forwardRef<TaskFormRef, TaskFormProps>(
  function ItemForm({title, onTitleChange, onSubmit, onVisibilityChange}, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useImperativeHandle(ref, () => ({
      show: () => setIsVisible(true)
    }))

    useEffect(() => {
      onVisibilityChange(isVisible)
    }, [isVisible])

    useLayoutEffect(() => {
      if (isVisible && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isVisible])

    const handleSubmit: FormEventHandler = event => {
      event.preventDefault()

      if (isEmpty(title)) {
        return
      }

      onSubmit()
    }

    function onReset() {
      onTitleChange('')

      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    return (
      <div className={clsx('box-content px-4')}>
        {isVisible && (
          <div
            ref={backdropRef}
            className={clsx(
              'flex flex-col',
              'transition ease-in duration-75 backdrop-filter',
              {
                'z-20 fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm': isVisible
              }
            )}
          >
            <div className="p-2 flex items-center justify-between">
              <button
                className="
                  pl-2 pr-4 py-2
                  flex justify-center items-center
                  text-white text-lg font-bold
                  rounded
                  transition ease-in duration-150
                  active:bg-white active:bg-opacity-20
                  focus:outline-none
                "
                onClick={() => setIsVisible(false)}
              >
                <ChevronLeftIcon className="w-8 h-8 mr-2" /> Go Back
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="relative h-full flex items-center">
                <input
                  ref={inputRef}
                  className="
                    w-full px-6 py-2 flex items-center
                    text-2xl font-bold
                    caret-white text-white placeholder-white
                    bg-transparent
                    rounded-lg appearance-none
                    transition ease-in duration-150
                    focus:outline-none
                  "
                  placeholder="Type something..."
                  type="text"
                  value={title}
                  onInput={e => {
                    onTitleChange((e.target as HTMLInputElement).value)
                  }}
                />
                {!isEmpty(title) && (
                  <button
                    type="button"
                    className="
                      absolute right-0 
                      text-white text-3xl p-4 
                      transition ease-in duration-150
                      focus:outline-none 
                      active:text-gray-500
                    "
                    onClickCapture={onReset}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
            <div className="mt-auto p-4 bg-gradient-to-t from-gray-600">
              {isEmpty(title) ? (
                <button
                  className="
                    w-full px-4 py-2.5
                    bg-white bg-opacity-10
                    border border-white border-opacity-20
                    text-center font-bold text-white text-lg
                    shadow-md rounded select-none
                    transition ease-in duration-75
                    active:bg-white active:bg-opacity-20
                    focus:outline-none
                  "
                  onClick={() => setIsVisible(false)}
                >
                  Close
                </button>
              ) : (
                <button
                  className="
                    w-full px-4 py-2.5
                    bg-blue-500 border border-blue-600 
                    text-center font-bold text-white text-lg
                    shadow-lg rounded select-none
                    transition ease-in duration-75
                    active:bg-blue-600
                    focus:outline-none
                  "
                  onClick={() => {
                    setIsVisible(false)
                    onSubmit()
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
