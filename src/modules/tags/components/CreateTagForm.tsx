import clsx, {ClassValue} from 'clsx'
import React, {FormEventHandler, useState} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {Button} from '@components/Button'
import {akira} from '@lib/akira'

type Props = {
  className?: ClassValue
}

export const CreateTagForm: React.FC<Props> = ({className}) => {
  const [name, setName] = useState<string>('')
  const queryClient = useQueryClient()
  const createTagMutation = useMutation(akira.tags.create, {
    onSuccess() {
      queryClient.invalidateQueries(['tags'])
    }
  })

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()
    createTagMutation.mutate(name)
    setName('')
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
          'focus:ring'
        )}
        onChange={e => setName(e.target.value)}
      />
      <Button className="mt-4 w-full" size="md" variant="blue">
        Create
      </Button>
    </form>
  )
}
