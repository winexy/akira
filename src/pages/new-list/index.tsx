import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {Redirect} from 'react-router'
import {akira} from 'shared/api/akira'
import {PageView} from 'shared/ui/page-view'

const NewListPage: React.FC = () => {
  const [title, setTitle] = useState('Untitled list')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const createListMutation = useMutation(akira.lists.create, {
    onSuccess() {
      queryClient.invalidateQueries('lists')
    }
  })

  const {data: list} = createListMutation

  useLayoutEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (list && list.title !== title) {
      setTitle(list.title)
    }
  }, [list, title])

  function onInputBlur() {
    if (createListMutation.isIdle) {
      createListMutation.mutate(title)
    }
  }

  return (
    <PageView>
      {list ? <Redirect to={`/lists/${list.id}`} /> : null}
      <div className="">
        <input
          ref={inputRef}
          type="text"
          value={title}
          placeholder="Untitled list"
          className="
            w-full px-4 py-2
            text-2xl font-semibold 
            text-gray-700 dark:text-gray-200
            appearance-none 
            transition ease-in duration-150
            focus:bg-gray-100 dark:focus:bg-dark-500 focus:outline-none
          "
          onChange={event => {
            setTitle(event.target.value)
          }}
          onBlur={onInputBlur}
        />
      </div>
    </PageView>
  )
}

export default NewListPage
