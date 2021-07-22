import React, {useState} from 'react'
import {useQuery} from 'react-query'
import debounce from 'debounce-promise'
import {api} from '@lib/api'
import {Tasks} from '@components/Tasks'
import {AdjustmentsIcon, SearchIcon, XIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
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

  return (
    <MainView>
      <form className="mt-4 px-4" onSubmit={event => event.preventDefault()}>
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
          <div className="relative flex items-center">
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
      <section className="mt-4 px-4">
        <Tasks isPending={searchQuery.isLoading} tasks={searchQuery.data} />
      </section>
    </MainView>
  )
}
