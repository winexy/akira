import React, {useState} from 'react'
import {useQuery} from 'react-query'
import debounce from 'debounce-promise'
import {api} from '@lib/api'
import {Tasks} from '@components/Tasks'
import {AdjustmentsIcon, SearchIcon, XIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {showBottomSheet} from '@store/bottom-sheet'
import {DatePicker} from '@components/DatePicker'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import format from 'date-fns/format'
import {Button} from '@components/Button'
import {MainView} from '../MainView'

const search = debounce((searchText: string) => {
  if (searchText === '') {
    return Promise.resolve([])
  }

  return api
    .get('tasks/search', {
      params: {
        query: searchText
      }
    })
    .then(res => res.data)
}, 300)

export const SearchView: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const searchQuery = useQuery(['search', searchText], () => {
    return search(searchText)
  })
  const [createdBefore, setCreatedBefore] = useState<Date | null>(null)

  return (
    <MainView>
      <form className="mt-2 px-4" onSubmit={event => event.preventDefault()}>
        <div
          className={clsx(
            'flex',
            'rounded-md shadow-sm',
            'border border-gray-200',
            'transition ease-in duration-150',
            'focus-within:border-indigo-400',
            'focus-within:ring focus-within:ring-indigo-100'
          )}
        >
          <div className="relative flex flex-1 items-center">
            <SearchIcon className="absolute left-0 ml-4 w-6 h-6" />
            <input
              type="search"
              enterKeyHint="search"
              className="
              w-full px-12 py-3 
              rounded-l-md
              appearance-none
              focus:outline-none
            "
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
            />
            {searchText && (
              <button
                type="button"
                className="
                absolute right-0  w-8 h-8 rounded 
                flex items-center justify-center
                transition ease-in duration-100 border border-none
                focus:outline-none
                active:bg-gray-100 active:border-gray-200
              "
                onClick={() => setSearchText('')}
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            className={clsx(
              'rounded-r-md px-3',
              'transition ease-in duration-150',
              'active:text-indigo-400',
              'focus:outline-none'
            )}
            onClick={() => showBottomSheet('search-filters')}
          >
            <AdjustmentsIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
      <BottomSheet name="search-filters" className="py-4">
        <h2 className="px-4 font-bold text-2xl">Search Filters</h2>
        <section className="mt-4 border-t">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center justify-between p-4"
          >
            <h3 className="font-semibold">Created before</h3>
            {createdBefore && <span>{format(createdBefore, 'dd.MM.yy')}</span>}
          </div>
          <div className="px-4">
            <DatePicker date={createdBefore} onChange={setCreatedBefore} />
          </div>
        </section>
        <div className="p-4 sticky bottom-0">
          <Button className="w-full" size="md">
            Apply
          </Button>
        </div>
      </BottomSheet>
      <section className="mt-4 px-4">
        <Tasks isPending={searchQuery.isLoading} tasks={searchQuery.data} />
      </section>
    </MainView>
  )
}
