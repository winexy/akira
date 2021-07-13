import React, {useState} from 'react'
import {useQuery} from 'react-query'
import debounce from 'debounce-promise'
import {api} from '@lib/api'
import {Tasks} from '@components/Tasks'
import {SearchIcon, XIcon} from '@heroicons/react/solid'
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
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-0 ml-4 w-6 h-6" />
          <input
            type="search"
            enterKeyHint="search"
            className="
              w-full px-12 py-3 
              rounded-md border border-gray-200 
              appearance-none shadow-sm
              transition ease-in duration-75 
              focus:border-indigo-400 focus:outline-none
              focus:shadow-xl
              focus:ring focus:ring-indigo-200
            "
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
          />
          {searchText && (
            <button
              type="button"
              className="
                absolute right-0 mr-2 w-8 h-8 rounded 
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
      </form>
      <section className="mt-4 px-4">
        <Tasks isPending={searchQuery.isLoading} tasks={searchQuery.data} />
      </section>
    </MainView>
  )
}
