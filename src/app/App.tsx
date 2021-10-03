import React, {lazy, Suspense} from 'react'
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
import {TodayView} from '@views/TodayView'
import {AuthView} from '@views/AuthView/AuthView'
import {Menu} from '@shared/ui/menu'
import {AkiraLoader} from '@shared/ui/akira-spinner'
import {Button} from '@shared/ui/button'
import {PageView} from '@shared/ui/page-view'
import {useFirebaseAuth} from '@shared/lib/firebase'
import {NotificationManager} from '@modules/notifications/NotificationManager'

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

const TaskView = lazy(() => import('@views/TaskView/TaskView'))
const TasksView = lazy(() => import('@views/TasksView'))
const TagsView = lazy(() => import('@modules/tags/views/TagsView'))
const NewListView = lazy(() => import('@views/NewListView'))
const WipView = lazy(() => import('@views/WipView/WipView'))
const ListsView = lazy(() => import('@views/ListsView'))
const TaskListView = lazy(() => import('@views/TaskListView'))
const SearchView = lazy(() => import('@views/SearchView'))
const ReportsView = lazy(() => import('@modules/reports/ReportsView'))
const PreferencesView = lazy(
  () => import('@modules/preferences/PreferencesView')
)
const NoteView = lazy(() => import('@views/NoteView'))

const LoadingView: React.FC = () => (
  <PageView className="p-4">loading...</PageView>
)

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
                <Suspense fallback={<LoadingView />}>
                  <TasksView />
                </Suspense>
              </Route>
              <Route path="/tasks/:taskId">
                <Suspense fallback={<LoadingView />}>
                  <TaskView />
                </Suspense>
              </Route>
              <Route path="/search">
                <Suspense fallback={<LoadingView />}>
                  <SearchView />
                </Suspense>
              </Route>
              <Route path="/wip">
                <WipView />
              </Route>
              <Route path="/tags">
                <Suspense fallback={<LoadingView />}>
                  <TagsView />
                </Suspense>
              </Route>
              <Route path="/lists/new">
                <Suspense fallback={<LoadingView />}>
                  <NewListView />
                </Suspense>
              </Route>
              <Route path="/lists/:listId">
                <Suspense fallback={<LoadingView />}>
                  <TaskListView />
                </Suspense>
              </Route>
              <Route path="/lists">
                <Suspense fallback={<LoadingView />}>
                  <ListsView />
                </Suspense>
              </Route>
              <Route path="/note">
                <Suspense fallback={<LoadingView />}>
                  <NoteView />
                </Suspense>
              </Route>
              <Route path="/reports">
                <Suspense fallback={<LoadingView />}>
                  <ReportsView />
                </Suspense>
              </Route>
              <Route path="/preferences">
                <Suspense fallback={<LoadingView />}>
                  <PreferencesView />
                </Suspense>
              </Route>
            </Switch>
          </Menu>
        </ErrorBoundary>
      </Router>
      <NotificationManager />
      <ReactQueryDevtools />
    </DndProvider>
  )
}

export default App
