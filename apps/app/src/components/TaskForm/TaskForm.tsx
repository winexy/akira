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
import isUndefined from 'lodash/fp/isUndefined'
import {ChevronLeftIcon, XCircleIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {useTagsQuery} from '@modules/tags/hooks/index'
import {Button} from '@components/Button'
import {TagT} from '@store/tasks/types'
import {TagsGrid} from '@components/TagsGrid/TagsGrid'
import {Tag} from '../Tag/Tag'

type TaskFormProps = {
  onSubmit(title: string): void
  onVisibilityChange(isVisible: boolean): void
}

export type TaskFormRef = {
  show(): void
}

export const TaskForm = forwardRef<TaskFormRef, TaskFormProps>(
  ({onSubmit, onVisibilityChange}, ref) => {
    const [title, setTitle] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const {data: tags} = useTagsQuery()
    const [selectedTags, setSelectedTags] = useState(new Set<number>())

    useImperativeHandle(ref, () => ({
      show: () => setIsVisible(true)
    }))

    useEffect(() => {
      onVisibilityChange(isVisible)
    }, [isVisible, onVisibilityChange])

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

      onSubmit(title)
      setTitle('')
      setSelectedTags(new Set())
    }

    function onReset() {
      setTitle('')

      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    function toggleTag(tag: TagT) {
      const newSet = new Set(selectedTags)

      if (newSet.has(tag.id)) {
        newSet.delete(tag.id)
      } else {
        newSet.add(tag.id)
      }

      setSelectedTags(newSet)
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
              <div className="relative h-full flex flex-col items-center">
                <input
                  ref={inputRef}
                  className="
                    w-full px-6 py-2 pr-12 flex items-center
                    text-2xl font-bold
                    caret-white text-white placeholder-white placeholder-opacity-80
                    bg-transparent
                    rounded-lg appearance-none
                    transition ease-in duration-150
                    focus:outline-none
                  "
                  placeholder="Type something..."
                  type="text"
                  value={title}
                  onInput={e => {
                    setTitle((e.target as HTMLInputElement).value)
                  }}
                  enterKeyHint="send"
                />
                {!isUndefined(tags) && (
                  <TagsGrid HtmlTag="ul" className="px-6 mt-2">
                    {tags.map(tag => (
                      <li key={tag.id}>
                        <Tag
                          variant={
                            selectedTags.has(tag.id) ? 'blue' : 'transparent'
                          }
                          onClick={() => toggleTag(tag)}
                        >
                          {tag.name}
                        </Tag>
                      </li>
                    ))}
                  </TagsGrid>
                )}
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
                <Button
                  size="md"
                  variant="transparent"
                  className="w-full select-none text-lg"
                  onClick={() => setIsVisible(false)}
                >
                  Close
                </Button>
              ) : (
                <Button
                  size="md"
                  className="w-full select-none text-lg"
                  onClick={() => {
                    setIsVisible(false)
                    onSubmit(title)
                  }}
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
