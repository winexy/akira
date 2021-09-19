import React, {
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
  FormEventHandler,
  useEffect,
  KeyboardEventHandler
} from 'react'
import isEmpty from 'lodash/fp/isEmpty'
import isUndefined from 'lodash/fp/isUndefined'
import {
  ChevronLeftIcon,
  PlusIcon,
  XCircleIcon,
  PencilAltIcon
} from '@heroicons/react/solid'
import clsx from 'clsx'
import {useTagsQuery} from '@modules/tags/hooks/index'
import {Button} from '@components/Button'
import {TaskTag} from '@modules/tags/types.d'
import {TagsGrid} from '@components/TagsGrid/TagsGrid'
import {CreateTaskMeta} from '@lib/akira/tasks/tasks'
import {TaskList} from '@modules/lists/types.d'
import filter from 'lodash/fp/filter'
import lowerCase from 'lodash/fp/lowerCase'
import toLower from 'lodash/fp/toLower'
import {useHotkey} from '@modules/hotkeys/HotKeyContext'
import {HotKey} from '@modules/hotkeys/HotKey'
import {Tag} from '../Tag/Tag'
import {useListsQuery} from '../../modules/lists/hooks/index'
import {BottomSheet} from '../BottomSheet/BottomSheet'
import {showBottomSheet, hideBottomSheet} from '../../store/bottom-sheet/index'

type TaskFormProps = {
  onSubmit(payload: {title: string; meta: CreateTaskMeta}): void
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
    const {data: lists} = useListsQuery()
    const [selectedTags, setSelectedTags] = useState(new Set<number>())
    const [selectedList, setSelectedList] = useState<TaskList | null>(null)
    const [search, setSearch] = useState('')

    const filteredList = filter(list => {
      return lowerCase(list.title).includes(search)
    }, lists)

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

    useHotkey(HotKey.of('k', HotKey.Meta), {
      description: 'open task form',
      handler() {
        setIsVisible(true)
      }
    })

    useEffect(() => {
      if (!isVisible) {
        return () => {}
      }

      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsVisible(false)
        }
      }

      window.addEventListener('keydown', handler)

      return () => {
        window.removeEventListener('keydown', handler)
      }
    }, [isVisible])

    const handleSubmit: FormEventHandler = event => {
      event.preventDefault()

      if (isEmpty(title)) {
        return
      }

      onSubmit({
        title,
        meta: {
          tags: [...selectedTags],
          list_id: selectedList?.id
        }
      })

      setTitle('')
      setSelectedTags(new Set())
      setSelectedList(null)
    }

    function onReset() {
      setTitle('')

      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    function toggleTag(tag: TaskTag) {
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
                'z-20 fixed inset-0 bg-black dark:bg-dark-500 bg-opacity-60 dark:bg-opacity-60 backdrop-blur-sm': isVisible
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
            <form id="create-task-form" onSubmit={handleSubmit}>
              <div className="relative h-full flex flex-col items-start">
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
                {!isUndefined(lists) && (
                  <div className="mt-4 w-full px-6 text-white flex justify-between items-center">
                    <Button
                      size="sm"
                      className="w-full text-left justify-between font-bold"
                      variant="transparent"
                      type="button"
                      onClick={() => showBottomSheet('lists')}
                    >
                      {selectedList ? (
                        <>
                          {selectedList.title}
                          <PencilAltIcon className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Add to List
                          <PlusIcon className="w-6 h-6" />
                        </>
                      )}
                    </Button>
                  </div>
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
            <div className="mt-auto p-4 bg-gradient-to-t from-gray-600 dark:from-dark-600">
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
                  form="create-task-form"
                  type="submit"
                >
                  Submit
                </Button>
              )}
            </div>
            <BottomSheet name="lists" className="pt-6">
              <div className="px-4">
                <input
                  className="w-full rounded px-1 appearance-none text-lg font-bold focus:outline-none bg-transparent"
                  placeholder="Search list..."
                  onInput={e =>
                    setSearch(toLower((e.target as HTMLInputElement).value))
                  }
                />
              </div>
              {lists && (
                <ul className="mt-4 divide-y divide-gray-100 dark:divide-dark-400">
                  {filteredList.map(list => (
                    <li
                      key={list.id}
                      className={clsx(
                        'px-4 py-3 font-semibold text-lg',
                        'transition ease-in duration-75',
                        'active:text-blue-500 active:bg-gray-50',
                        list.id === selectedList?.id ? 'text-blue-500' : ''
                      )}
                      onClick={() => {
                        if (list.id === selectedList?.id) {
                          setSelectedList(null)
                        } else {
                          setSelectedList(list)
                        }
                        hideBottomSheet()
                      }}
                    >
                      {list.title}
                    </li>
                  ))}
                </ul>
              )}
            </BottomSheet>
          </div>
        )}
      </div>
    )
  }
)
