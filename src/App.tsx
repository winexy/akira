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
import {ImportantView} from './views/ImportantView'
import {TasksView} from './views/TasksView'
import {TagsView} from './modules/tags/views'

const dndConfig = {
  enableMouseEvents: true
}

const SvgLoader = (
  <svg
    width="57"
    height="57"
    viewBox="0 0 57 57"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)" strokeWidth="2">
        <circle cx="5" cy="50" r="5">
          <animate
            attributeName="cy"
            begin="0s"
            dur="2.2s"
            values="50;5;50;50"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            begin="0s"
            dur="2.2s"
            values="5;27;49;5"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="27" cy="5" r="5">
          <animate
            attributeName="cy"
            begin="0s"
            dur="2.2s"
            from="5"
            to="5"
            values="5;50;50;5"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            begin="0s"
            dur="2.2s"
            from="27"
            to="27"
            values="27;49;5;27"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="49" cy="50" r="5">
          <animate
            attributeName="cy"
            begin="0s"
            dur="2.2s"
            values="50;50;5;50"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            from="49"
            to="49"
            begin="0s"
            dur="2.2s"
            values="49;5;27;49"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </g>
  </svg>
)

function App() {
  const {isLoading, isAuthenticated} = useFirebaseAuth()

  if (isLoading) {
    return (
      <div className="flex-1 flex-col flex justify-center items-center text-white">
        {SvgLoader}
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
            <Route path="/tasks/:id">
              <TaskView />
            </Route>
            <Route path="/important">
              <ImportantView />
            </Route>
            <Route path="/wip">
              <WipView />
            </Route>
            <Route path="/tags">
              <TagsView />
            </Route>
          </Switch>
        </Menu>
      </Router>
      <ReactQueryDevtools />
    </DndProvider>
  )
}

export default App
