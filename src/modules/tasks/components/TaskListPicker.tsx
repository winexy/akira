import React from 'react'
import {useListsQuery} from 'modules/lists/hooks'
import {usePatchTaskMutation} from 'modules/tasks/hooks'
import {ApiTask} from 'modules/tasks/types.d'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'
import {Spin} from 'shared/ui/spin'
import {List} from 'shared/ui/list'
import isEmpty from 'lodash/fp/isEmpty'
import get from 'lodash/fp/get'
import {NewListLink, NoLists} from 'entities/task-list'
import {StickyBottomSheetBox} from 'shared/ui/sticky-bottom-sheet-box'

type Props = {
  taskId: ApiTask['id']
  activeListId: ApiTask['list_id']
}

type MatchComponent = React.FC & {
  Case: React.FC<CaseWhen>
  Default: React.FC<CaseDefault>
}

const Match: MatchComponent = ({children}) => {
  const child = React.Children.toArray(children).find(child => {
    return Boolean(get('props.when', child) || get('props.default', child))
  })

  return <>{child}</>
}

type CaseWhen = {
  when: boolean
}

type CaseDefault = {
  default?: true
}

Match.Case = ({children}) => {
  return <>{children}</>
}

Match.Default = ({children}) => {
  return <>{children}</>
}

Match.Default.defaultProps = {
  default: true,
}

export const TaskListPicker: React.FC<Props> = ({taskId, activeListId}) => {
  const {data: lists = [], isLoading} = useListsQuery()
  const patchTaskMutation = usePatchTaskMutation(taskId)

  return (
    <>
      <div className="sticky top-0 p-4 border-b border-gray-100 dark:border-dark-500">
        <h2 className="text-xl font-semibold">Add to list</h2>
      </div>
      <Match>
        <Match.Case when={isLoading}>
          <div className="flex items-center justify-center flex-col py-12">
            <Spin className="text-gray-100 w-8 h-8" />
            <p className="mt-4 text-xl font-semibold text-gray-400">
              Loading...
            </p>
          </div>
        </Match.Case>
        <Match.Case when={isEmpty(lists)}>
          <NoLists />
        </Match.Case>
        <Match.Default>
          <List>
            {lists.map(list => (
              <List.Item key={list.id}>
                <button
                  type="button"
                  className={clsx(
                    'w-full flex items-center px-4 py-3',
                    'font-semibold text-left ',
                    'focus:outline-none',
                    {
                      'text-blue-500': list.id === activeListId,
                    },
                  )}
                  onClick={() => {
                    patchTaskMutation.mutate({
                      list_id: list.id,
                    })
                  }}
                  disabled={list.id === activeListId}
                >
                  {list.title}
                  <Match>
                    <Match.Case
                      when={
                        patchTaskMutation.isLoading &&
                        patchTaskMutation.variables?.list_id === list.id
                      }
                    >
                      <Spin className="ml-auto text-gray-200 w-5 h-5" />
                    </Match.Case>
                    <Match.Case when={list.id === activeListId}>
                      <CheckIcon className="ml-auto w-5 h-5" />
                    </Match.Case>
                  </Match>
                </button>
              </List.Item>
            ))}
          </List>
        </Match.Default>
      </Match>
      <StickyBottomSheetBox>
        <NewListLink />
      </StickyBottomSheetBox>
    </>
  )
}
