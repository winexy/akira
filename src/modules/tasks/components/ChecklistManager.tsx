import isEmpty from 'lodash/fp/isEmpty'
import React, {FormEventHandler, useLayoutEffect, useRef, useState} from 'react'
import {ApiTask} from '@modules/tasks/types.d'
import {ClipboardCheckIcon} from '@heroicons/react/solid'
import {Button} from '@components/Button'
import clsx from 'clsx'
import {useAddTodoMutation} from '../hooks'
import {Checklist} from './Checklist'

type Props = {
  task: ApiTask
}

export const ChecklistManager: React.FC<Props> = ({task}) => {
  const [todoTitle, setTodoTitle] = useState('')
  const [isTodoInputVisible, setIsTodoInputVisible] = useState(false)
  const todoInputRef = useRef<HTMLInputElement | null>(null)
  const addTodoMutation = useAddTodoMutation(task.id)

  useLayoutEffect(() => {
    if (isTodoInputVisible) {
      todoInputRef.current?.focus()
    }
  }, [isTodoInputVisible])

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      addTodoMutation.mutate(todoTitle)
      setTodoTitle('')
    }
  }

  return (
    <>
      <section className="mt-4 px-4">
        {isEmpty(task.checklist) && !isTodoInputVisible ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTodoInputVisible(true)}
          >
            <ClipboardCheckIcon className="mr-2 w-4 h-4" />
            Add Checklist
          </Button>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              ref={todoInputRef}
              value={todoTitle}
              placeholder="Add todo..."
              className={clsx(
                'bg-gray-200 dark:bg-dark-400 bg-opacity-50 px-4 py-2 rounded-md border shadow-inner',
                'appearance-none border border-gray-300',
                'focus:outline-none focus:border-indigo-500'
              )}
              onInput={e => setTodoTitle((e.target as HTMLInputElement).value)}
              onBlur={() => setIsTodoInputVisible(false)}
              enterKeyHint="send"
            />
          </form>
        )}
      </section>
      <Checklist taskId={task.id} checklist={task.checklist} />
    </>
  )
}
