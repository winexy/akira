import React from 'react'
import {ReactQueryDevtools} from 'react-query/devtools'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'
import {TodayView} from '@/views/TodayView'
import {TaskView} from '@views/TaskView/TaskView'
import {AuthView} from '@views/AuthView/AuthView'
import {WipView} from '@views/WipView/WipView'
import {Menu} from '@components/Menu/Menu'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {useFirebaseAuth} from './firebase/Provider'
import {TasksView} from './views/TasksView'
import {TagsView} from './modules/tags/views'
import {NewListView} from './views/NewListView'
import {ListsView} from './views/ListsView'
import {AkiraLoader} from './components/AkiraLoader'

const dndConfig = {
  enableMouseEvents: true
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
      </Router>
      <ReactQueryDevtools />
    </DndProvider>
  )
}

export default App
