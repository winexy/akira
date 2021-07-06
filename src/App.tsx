import React from 'react'
import {ReactQueryDevtools} from 'react-query/devtools'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory
} from 'react-router-dom'
import {HomeIcon, RefreshIcon} from '@heroicons/react/solid'
import {TodayView} from '@/views/TodayView'
import {TaskView} from '@views/TaskView/TaskView'
import {AuthView} from '@views/AuthView/AuthView'
import {WipView} from '@views/WipView/WipView'
import {Menu} from '@components/Menu/Menu'
import {Button} from '@components/Button'
import {TasksView} from './views/TasksView'
import {useFirebaseAuth} from './firebase/Provider'
import {TagsView} from './modules/tags/views'
import {NewListView} from './views/NewListView'
import {ListsView} from './views/ListsView'
import {AkiraLoader} from './components/AkiraLoader'

const dndConfig = {
  enableMouseEvents: true
}

function Fallback({error, resetErrorBoundary}: FallbackProps) {
  const history = useHistory()

  return (
    <div className="min-h-screen pt-6 px-6 bg-white flex flex-col text-gray-700">
      <h1 className="font-semibold text-xl text-red-500">
        Something went wrong
      </h1>
      <p className="mt-4 font-semibold">{error.message}</p>
      <pre className="mt-4 overflow-auto">{error.stack}</pre>
      <div className="py-6 flex space-x-4">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={() => window.location.reload()}
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
        </Button>
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={() => {
            history.push('/')
            resetErrorBoundary()
          }}
        >
          <HomeIcon className="w-5 h-5 mr-2" />
        </Button>
      </div>
    </div>
  )
}

function App() {
  const {isLoading, isAuthenticated} = useFirebaseAuth()

  if (isLoading) {
    return (
      <div className="flex-1 flex-col flex justify-center items-center text-white">
        <AkiraLoader />
        <h1 className="mt-8 font-mono font-bold text-4xl">Akira</h1>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthView />
  }

  return (
    <DndProvider backend={TouchBackend} options={dndConfig}>
      <Router>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Menu>
            <Switch>
              <Route path="/" exact>
                <TodayView />
              </Route>
              <Route path="/tasks" exact>
                <TasksView />
              </Route>
              <Route path="/tasks/:taskId">
                <TaskView />
              </Route>
              <Route path="/wip">
                <WipView />
              </Route>
              <Route path="/tags">
                <TagsView />
              </Route>
              <Route path="/lists/new">
                <NewListView />
              </Route>
              <Route path="/lists">
                <ListsView />
              </Route>
            </Switch>
          </Menu>
        </ErrorBoundary>
      </Router>
      <ReactQueryDevtools />
    </DndProvider>
  )
}

export default App
