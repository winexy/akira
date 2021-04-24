import React, {
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle
} from 'react'
import isEmpty from 'lodash/fp/isEmpty'
import {XCircleIcon} from '@heroicons/react/solid'
import clsx from 'clsx'

export const TodoForm = forwardRef(function ItemForm(
  {title, onTitleChange, onSubmit},
  ref
) {
  const inputRef = useRef()
  const [isVisible, setIsVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    show: () => setIsVisible(true)
  }))

  useLayoutEffect(() => {
    if (isVisible) {
      inputRef.current.focus()
    }
  }, [isVisible])

  function handleSubmit(e) {
    if (isEmpty(title)) {
      e.preventDefault()
      return
    }

    onSubmit(e)
  }

  function onReset() {
    onTitleChange('')
    inputRef.current.focus()
  }

  function onOutsideClick(event) {
    if (event.target === backdropRef.current) {
      setIsVisible(false)
    }
  }

  const backdropRef = useRef()

  return (
    <div className={clsx('box-content px-4')}>
      {isVisible && (
        <div
          ref={backdropRef}
          className={clsx('transition ease-in duration-75 backdrop-filter', {
            'p-4 z-20 fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm': isVisible
          })}
          onClick={onOutsideClick}
        >
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                className="
                  w-full pl-4 py-3 pr-12
                  text-2xl caret-white text-white placeholder-white
                  bg-white bg-opacity-40
                  border border-gray-200
                  rounded-lg shadow appearance-none
                  transition ease-in duration-150
                  focus:outline-none focus:shadow-2xl
                "
                placeholder="Bread..."
                type="text"
                value={title}
                onInput={e => onTitleChange(e.target.value)}
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
        </div>
      )}
    </div>
  )
})
