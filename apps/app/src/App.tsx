import React, {useEffect} from 'react'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {MainView} from '@views/MainView/MainView'
import {Header} from './components/Header/Header'

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

const dndConfig = {
  enableMouseEvents: true
}


// @ts-ignore
console.log(import.meta.env.VITE_MSG)

function App() {
  useBodyBackground()

  return (
    <DndProvider backend={TouchBackend} options={dndConfig}>
      <React.Fragment>
        <Header />
        <main className="flex-1">
          <MainView />
        </main>
      </React.Fragment>
    </DndProvider>
  )
}

export default App
