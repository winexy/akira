import React, {
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
  FormEventHandler,
} from 'react'
import {useStore} from 'effector-react'
import isEmpty from 'lodash/fp/isEmpty'
import isUndefined from 'lodash/fp/isUndefined'
import {
  ChevronLeftIcon,
  PlusIcon,
  XCircleIcon,
  PencilAltIcon,
} from '@heroicons/react/solid'
import clsx from 'clsx'
import {useTagsQuery} from 'modules/tags/hooks/index'
import {bottomSheetModel, BottomSheet} from 'shared/ui/bottom-sheet'
import {Button} from 'shared/ui/button'
import {TaskTag} from 'modules/tags/types.d'
import {TagsGrid} from 'modules/tags/components/TagsGrid'
import filter from 'lodash/fp/filter'
import lowerCase from 'lodash/fp/lowerCase'
import toLower from 'lodash/fp/toLower'
import trim from 'lodash/fp/trim'
import isNull from 'lodash/fp/isNull'
import format from 'date-fns/format'
import {TextArea} from 'modules/tasks/components'
import {CalendarIcon} from '@heroicons/react/outline'
import {CreateTaskPayload} from 'modules/tasks/types.d'
import isTomorrow from 'date-fns/isTomorrow'
import isToday from 'date-fns/isToday'
import {Tag} from 'shared/ui/tag'
import {DatePickerSheet} from 'shared/ui/datepicker-sheet'
import {DatePicker} from 'shared/ui/datepicker'
import {DatePickerShortcut} from 'shared/ui/datepicker-shortcut'
import {List} from 'shared/ui/list'
import {useListsQuery} from 'modules/lists/hooks'
import {StickyBottomSheetBox} from 'shared/ui/sticky-bottom-sheet-box'
import {NewListLink, NoLists} from 'entities/task-list'
import {Transition} from 'shared/ui/transition'
import {useFormVisibility} from './use-form-visibility'
import {
  $title,
  $description,
  $date,
  $dueDate,
  $selectedTags,
  $selectedList,
  resetForm,
  onTitleChange,
  onTagsToggle,
  onDescriptionChange,
  onDateChange,
  onDueDateChange,
  onListChange,
} from './model'

type TaskFormProps = {
  onSubmit(payload: CreateTaskPayload): void
  onVisibilityChange(isVisible: boolean): void
}

export type TaskFormRef = {
  show(): void
}

function renderDate(date: Date) {
  if (isToday(date)) {
    return 'Today'
  }

  if (isTomorrow(date)) {
    return 'Tomorrow'
  }

  return format(date, 'dd.MM.yyyy')
}

function withHighlight(originalText: string, search: string): string {
  return `<pre class="font-sans">${originalText.replace(
    new RegExp(search, 'i'),
    text => {
      return `<span class="text-blue-500 dark:text-gray-300">${text}</span>`
    },
  )}</pre>`
}

export const AddTaskForm = forwardRef<TaskFormRef, TaskFormProps>(
  // eslint-disable-next-line
  function TaskForm_ForwardRef({onSubmit, onVisibilityChange}, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)
    const title = useStore($title)
    const description = useStore($description)
    const date = useStore($date)
    const dueDate = useStore($dueDate)
    const selectedTags = useStore($selectedTags)
    const selectedList = useStore($selectedList)

    const {data: tags} = useTagsQuery()
    const {data: lists} = useListsQuery()
    const [search, setSearch] = useState('')
    const [isVisible, setIsVisible] = useFormVisibility({onVisibilityChange})

    const filteredList = filter(list => {
      return lowerCase(list.title).includes(trim(search))
    }, lists)

    useImperativeHandle(ref, () => ({
      show: () => setIsVisible(true),
    }))

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

      onSubmit({
        task: {
          title,
          description,
          due_date: isNull(dueDate) ? null : format(dueDate, 'yyyy-MM-dd'),
        },
        meta: {
          date: format(date, 'yyyy-MM-dd'),
          tags: [...selectedTags],
          list_id: selectedList?.id,
        },
      })

      resetForm()
    }

    function onReset() {
      onTitleChange('')

      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    function toggleTag(tag: TaskTag) {
      onTagsToggle(tag.id)
    }

    return (
      <div className={clsx('box-content px-4')}>
        {isVisible && (
          <div
            ref={backdropRef}
            className={clsx('flex flex-col', 'transition ease-in duration-75', {
              'z-20 fixed inset-0 bg-black dark:bg-dark-500 bg-opacity-60 dark:bg-opacity-60 backdrop-blur-sm': isVisible,
            })}
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
                    onTitleChange((e.target as HTMLInputElement).value)
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
                <div className="mt-4 w-full px-6 flex flex-col">
                  {!isUndefined(lists) && (
                    <Button
                      size="sm"
                      className="w-full text-left justify-between font-bold"
                      variant="transparent"
                      type="button"
                      onClick={() => bottomSheetModel.showBottomSheet('lists')}
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
                  )}
                  <Button
                    size="sm"
                    className="mt-4 text-left justify-between"
                    variant="transparent"
                    type="button"
                    onClick={() => {
                      bottomSheetModel.showBottomSheet('task-date')
                    }}
                  >
                    Date: {renderDate(date)}
                    <CalendarIcon className="w-6 h-6" />
                  </Button>
                  <Button
                    size="sm"
                    className="mt-4 text-left justify-between"
                    variant="transparent"
                    type="button"
                    onClick={() => {
                      bottomSheetModel.showBottomSheet('task-due-date')
                    }}
                  >
                    {isNull(dueDate)
                      ? 'Set due date'
                      : `Due date: ${renderDate(dueDate)}`}
                    <CalendarIcon className="w-6 h-6" />
                  </Button>
                  <TextArea
                    value={description}
                    className="mt-4 text-white"
                    placeholder="Add note"
                    onChange={onDescriptionChange}
                  />
                </div>
                <Transition.Shift
                  in={!isEmpty(title)}
                  from="right"
                  unmountOnExit
                >
                  <button
                    type="button"
                    className="
                      absolute right-0 
                      text-white text-3xl p-4 
                      focus:outline-none 
                      active:text-gray-500
                    "
                    onClickCapture={onReset}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </Transition.Shift>
              </div>
            </form>
            <DatePickerSheet
              name="task-date"
              title="Schedule task"
              date={date}
              fixedChildren={({hide}) => (
                <DatePickerShortcut
                  onPick={date => {
                    hide()
                    onDateChange(date)
                  }}
                />
              )}
            >
              <DatePicker
                date={date}
                minDate={new Date()}
                onChange={onDateChange}
              />
            </DatePickerSheet>
            <DatePickerSheet
              name="task-due-date"
              title="Set task due date"
              date={dueDate}
              fixedChildren={({hide}) => (
                <DatePickerShortcut
                  onPick={date => {
                    hide()
                    onDueDateChange(date)
                  }}
                />
              )}
            >
              <DatePicker
                date={dueDate}
                minDate={new Date()}
                onChange={onDueDateChange}
              />
            </DatePickerSheet>
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
            <BottomSheet.Standalone name="lists" className="pt-6">
              {!isEmpty(lists) && (
                <div className="px-4">
                  <input
                    className="w-full rounded appearance-none text-lg font-bold focus:outline-none bg-transparent"
                    placeholder="Search list..."
                    value={search}
                    onInput={e =>
                      setSearch(toLower((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              )}
              {isEmpty(lists) && <NoLists />}
              {lists && (
                <List className="mt-4">
                  {filteredList.map(list => (
                    <List.Item
                      key={list.id}
                      className={clsx(
                        'px-4 py-3 font-semibold ',
                        list.id === selectedList?.id ? 'text-blue-500' : '',
                      )}
                      onClick={() => {
                        if (list.id === selectedList?.id) {
                          onListChange(null)
                        } else {
                          onListChange(list)
                        }
                        bottomSheetModel.hideBottomSheet()
                      }}
                      dangerouslySetInnerHTML={{
                        __html: withHighlight(list.title, search),
                      }}
                    />
                  ))}
                </List>
              )}
              <StickyBottomSheetBox>
                <NewListLink />
              </StickyBottomSheetBox>
            </BottomSheet.Standalone>
          </div>
        )}
      </div>
    )
  },
)
