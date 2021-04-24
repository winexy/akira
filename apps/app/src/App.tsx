import React, {useEffect} from 'react'
import {MainView} from '@views/MainView/MainView.jsx'
import {MenuIcon} from '@heroicons/react/solid'

const mainStyles = {
  backgroundImage:
    'url(https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=1&auto=format%2Ccompress&fit=crop&w=2999&h=594%201x,%20https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=2&auto=format%2Ccompress&fit=crop&w=2999&h=594%202x)'
}

function useBodyBackground() {
  useEffect(() => {
    document.body.style.backgroundImage = mainStyles.backgroundImage
    document.body.style.backgroundSize = 'cover'
  }, [])
}

function App() {
  useBodyBackground()

  return (
    <React.Fragment>
      <header className="sticky top-0 z-20 px-4 py-2 flex items-center bg-black bg-opacity-60 shadow-lg">
        <h1 className="font-bold text-xl text-white font-mono">Akira</h1>
        <button
          className="
            ml-auto w-8 h-8 -mr-1
            flex items-center justify-center 
            text-white rounded 
            transition ease-in duration-150
            active:bg-gray-100 active:bg-opacity-20
            focus:outline-none focus:ring
          "
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1">
        <MainView />
      </main>
    </React.Fragment>
  )
}

export default App
