import isEmpty from 'lodash/fp/isEmpty'
import React, {
  ClipboardEventHandler,
  FormEventHandler,
  useRef,
  useState,
} from 'react'
import {ApiTask} from 'modules/tasks/types.d'
import clsx from 'clsx'
import compact from 'lodash/compact'
import {Spin} from 'shared/ui/spin'
import {Checklist} from './Checklist'
import {useAddTodoMutation, useBatchAddTodoMutation} from '../model'

type Props = {
  task: ApiTask
  onFocus(): void
  onBlur(): void
}

export const ChecklistManager: React.FC<Props> = ({task, onFocus, onBlur}) => {
  const [todoTitle, setTodoTitle] = useState('')
  const todoInputRef = useRef<HTMLInputElement | null>(null)
  const addTodoMutation = useAddTodoMutation(task.id)
  const batchAddTodoMutation = useBatchAddTodoMutation(task.id)

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      addTodoMutation.mutate(todoTitle)
      setTodoTitle('')
    }
  }

  const onPaste: ClipboardEventHandler<HTMLInputElement> = event => {
    const content = event.clipboardData.getData('text/plain')
    const items = compact(content.split(/\n/g))

    if (items.length === 1) {
      return
    }

    batchAddTodoMutation.mutateAsync(items)

    requestAnimationFrame(() => {
      setTodoTitle('')
    })
  }

  return (
    <>
      <div className="mt-2 px-4 flex items-center">
        <h2
          className={clsx('font-bold text-2xl', {
            'animate-pulse': batchAddTodoMutation.isLoading,
          })}
        >
          Checklist
        </h2>
        {batchAddTodoMutation.isLoading && (
          <Spin className="ml-auto w-5 h-5 text-gray-300" />
        )}
      </div>
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
              {'animate-pulse': !isEmpty(todoTitle)},
            )}
            onInput={e => setTodoTitle((e.target as HTMLInputElement).value)}
            onFocus={onFocus}
            onBlur={onBlur}
            onPaste={onPaste}
            enterKeyHint="send"
          />
        </form>
      </section>
    </>
  )
}
