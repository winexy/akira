import React, {useEffect} from 'react'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {MainView} from '@views/MainView/MainView'
import {Header} from './components/Header/Header'
import {useAuth0} from '@auth0/auth0-react'
import {AuthView} from './views/AuthView/AuthView'

const dndConfig = {
  enableMouseEvents: true
}

function App() {
  const {isAuthenticated} = useAuth0()

  console.log({isAuthenticated})

  return (
    <DndProvider backend={TouchBackend} options={dndConfig}>
      {!isAuthenticated ? (
        <AuthView />
      ) : (
        <React.Fragment>
          <Header />
          <main className="flex-1">
            <MainView />
          </main>
        </React.Fragment>
      )}
    </DndProvider>
  )
}

export default App
