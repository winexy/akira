import React, {lazy, Suspense} from 'react'
import {ReactQueryDevtools} from 'react-query/devtools'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useHistory
} from 'react-router-dom'
import {HomeIcon, RefreshIcon} from '@heroicons/react/solid'
import {DashboardPage} from 'pages/dashboard'
import {AuthPage} from 'pages/auth'
import {Menu} from 'shared/ui/menu'
import {AkiraLoader} from 'shared/ui/akira-spinner'
import {Button} from 'shared/ui/button'
import {PageView} from 'shared/ui/page-view'
import {useFirebaseAuth} from 'shared/lib/firebase'
import {NotificationManager} from 'modules/notifications/NotificationManager'
import {TaskPageFallback} from 'pages/task/fallback'

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

const TaskPage = lazy(() => import('pages/task'))
const TasksPage = lazy(() => import('pages/tasks'))
const TagsPage = lazy(() => import('pages/tags'))
const NewListPage = lazy(() => import('pages/new-list'))
const WipPage = lazy(() => import('pages/wip'))
const ListsPage = lazy(() => import('pages/lists'))
const TaskListPage = lazy(() => import('pages/task-list'))
const SearchPage = lazy(() => import('pages/search'))
const ReportsPage = lazy(() => import('pages/reports'))
const PreferencesPage = lazy(() => import('pages/preferences'))
const NotePage = lazy(() => import('pages/note'))
const NotesPage = lazy(() => import('pages/notes'))
const RecurrentTasksPage = lazy(() => import('pages/recurrent-tasks'))
const PomodoroPage = lazy(() => import('pages/pomodoro'))

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
    return <AuthPage />
  }

  return (
    <DndProvider backend={TouchBackend} options={dndConfig}>
      <Router>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Menu>
            <Switch>
              <Route path="/" exact>
                <Redirect to="/dashboard/today" />
              </Route>
              <Route path="/dashboard/:type" exact>
                <DashboardPage />
              </Route>
              <Route path="/tasks" exact>
                <Suspense fallback={<LoadingView />}>
                  <TasksPage />
                </Suspense>
              </Route>
              <Route path="/tasks/:taskId">
                <Suspense fallback={<TaskPageFallback />}>
                  <TaskPage />
                </Suspense>
              </Route>
              <Route path="/search">
                <Suspense fallback={<LoadingView />}>
                  <SearchPage />
                </Suspense>
              </Route>
              <Route path="/pomodoro">
                <Suspense fallback={<LoadingView />}>
                  <PomodoroPage />
                </Suspense>
              </Route>
              <Route path="/wip">
                <WipPage />
              </Route>
              <Route path="/tags">
                <Suspense fallback={<LoadingView />}>
                  <TagsPage />
                </Suspense>
              </Route>
              <Route path="/lists/new">
                <Suspense fallback={<LoadingView />}>
                  <NewListPage />
                </Suspense>
              </Route>
              <Route path="/lists/:listId">
                <Suspense fallback={<LoadingView />}>
                  <TaskListPage />
                </Suspense>
              </Route>
              <Route path="/lists">
                <Suspense fallback={<LoadingView />}>
                  <ListsPage />
                </Suspense>
              </Route>
              <Route path="/notes/:uuid" exact>
                <Suspense fallback={<LoadingView />}>
                  <NotePage />
                </Suspense>
              </Route>
              <Route path="/notes" exact>
                <Suspense fallback={<LoadingView />}>
                  <NotesPage />
                </Suspense>
              </Route>
              <Route path="/reports">
                <Suspense fallback={<LoadingView />}>
                  <ReportsPage />
                </Suspense>
              </Route>
              <Route path="/recurrent-tasks">
                <Suspense fallback={<LoadingView />}>
                  <RecurrentTasksPage />
                </Suspense>
              </Route>
              <Route path="/preferences">
                <Suspense fallback={<LoadingView />}>
                  <PreferencesPage />
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
