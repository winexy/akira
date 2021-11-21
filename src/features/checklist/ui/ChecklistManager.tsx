import isEmpty from 'lodash/fp/isEmpty'
import React, {FormEventHandler, useRef, useState} from 'react'
import {ApiTask} from 'modules/tasks/types.d'
import clsx from 'clsx'
import {Checklist} from './Checklist'
import {useAddTodoMutation} from '../model'

type Props = {
  task: ApiTask
}

export const ChecklistManager: React.FC<Props> = ({task}) => {
  const [todoTitle, setTodoTitle] = useState('')
  const todoInputRef = useRef<HTMLInputElement | null>(null)
  const addTodoMutation = useAddTodoMutation(task.id)

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      addTodoMutation.mutate(todoTitle)
      setTodoTitle('')
    }
  }

  return (
    <>
      <h2 className="mt-2 px-4 font-bold text-2xl">Checklist</h2>
      <Checklist taskId={task.id} checklist={task.checklist} />
      <section className="px-4">
        <form onSubmit={onSubmit}>
          <input
            ref={todoInputRef}
            value={todoTitle}
            placeholder="Add item..."
            className={clsx(
              'w-full bg-transparent py-2 rounded-md border',
              'appearance-none border-none',
              'focus:outline-none focus:animate-none',
              {'animate-pulse': !isEmpty(todoTitle)}
            )}
            onInput={e => setTodoTitle((e.target as HTMLInputElement).value)}
            enterKeyHint="send"
          />
        </form>
      </section>
    </>
  )
}
