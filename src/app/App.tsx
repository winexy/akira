import React, {lazy, Suspense} from 'react'
import {ReactQueryDevtools} from 'react-query/devtools'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
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
  enableMouseEvents: true,
}

function Fallback({error, resetErrorBoundary}: FallbackProps) {
  const navigate = useNavigate()

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
            navigate('/')
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
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/today" />} />
              <Route path="/dashboard/*" element={<DashboardPage />} />
              <Route
                path="/tasks"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <TasksPage />
                  </Suspense>
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <Suspense fallback={<TaskPageFallback />}>
                    <TaskPage />
                  </Suspense>
                }
              />
              <Route
                path="/search"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <SearchPage />
                  </Suspense>
                }
              />
              <Route
                path="/pomodoro"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <PomodoroPage />
                  </Suspense>
                }
              />
              <Route path="/wip" element={<WipPage />} />
              <Route
                path="/tags"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <TagsPage />
                  </Suspense>
                }
              />
              <Route
                path="/lists/new"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <NewListPage />
                  </Suspense>
                }
              />
              <Route
                path="/lists/:listId"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <TaskListPage />
                  </Suspense>
                }
              />
              <Route
                path="/lists"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <ListsPage />
                  </Suspense>
                }
              />
              <Route
                path="/notes"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <NotesPage />
                  </Suspense>
                }
              />
              <Route
                path="/reports/*"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <ReportsPage />
                  </Suspense>
                }
              />
              <Route
                path="/recurrent-tasks"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <RecurrentTasksPage />
                  </Suspense>
                }
              />
              <Route
                path="/preferences"
                element={
                  <Suspense fallback={<LoadingView />}>
                    <PreferencesPage />
                  </Suspense>
                }
              />
            </Routes>
          </Menu>
        </ErrorBoundary>
      </Router>
      <NotificationManager />
      <ReactQueryDevtools />
    </DndProvider>
  )
}

export default App
