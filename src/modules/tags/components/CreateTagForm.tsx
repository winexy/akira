import clsx, {ClassValue} from 'clsx'
import React, {FormEventHandler, useState} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {Button} from '@components/Button'
import {akira} from '@lib/akira'
import {Spin} from '@components/Spin'
import {TaskTag} from '@modules/tags/types.d'

type Props = {
  className?: ClassValue
}

export const CreateTagForm: React.FC<Props> = ({className}) => {
  const [name, setName] = useState<string>('')
  const [hasError, setHasError] = useState(false)
  const queryClient = useQueryClient()
  const createTagMutation = useMutation<TaskTag, Error, string>(
    akira.tags.create,
    {
      onSuccess() {
        queryClient.invalidateQueries(['tags'])
      }
    }
  )

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    const hasError = name === ''

    if (hasError) {
      setHasError(true)
      return
    }

    createTagMutation.mutate(name)
    setName('')
    setHasError(false)
  }

  return (
    <form onSubmit={onSubmit} className={clsx(className)}>
      <input
        value={name}
        type="text"
        placeholder="name"
        className={clsx(
          'w-full px-3 py-2',
          'appearance-none',
          'rounded-md border border-gray-300',
          'focus:outline-none focus:border-blue-500',
          'focus:ring',
          {
            'border-red-500': hasError
          }
        )}
        onChange={e => setName(e.target.value)}
      />
      <Button
        disabled={createTagMutation.isLoading}
        className="mt-4 w-full"
        size="md"
        variant="blue"
      >
        {createTagMutation.isLoading && (
          <Spin className="w-4 h-4 text-wite mr-2" />
        )}
        {createTagMutation.isLoading ? 'Loading...' : 'Create'}
      </Button>
      {hasError && (
        <p className="mt-4 text-red-500 font-semibold text-center">
          Tag name cannot be empty
        </p>
      )}
      {createTagMutation.isError && (
        <p className="mt-4 text-red-500 font-semibold text-center">
          {createTagMutation.error?.message}
        </p>
      )}
    </form>
  )
}
