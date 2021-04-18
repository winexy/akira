import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import {DndProvider} from 'react-dnd'
import {TouchBackend} from 'react-dnd-touch-backend'

const dndConfig = {
  enableMouseEvents: true,
}

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={TouchBackend} options={dndConfig}>
      <App />
    </DndProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
