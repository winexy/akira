import React from 'react'
import {MainView} from '@views/MainView/MainView.jsx'

const mainStyles = {
  backgroundImage:
    'url(https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=1&auto=format%2Ccompress&fit=crop&w=2999&h=594%201x,%20https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=2&auto=format%2Ccompress&fit=crop&w=2999&h=594%202x)'
}


function App() {
  return (
    <React.Fragment>
      <main className="flex-1 bg-indigo-400 bg-cover" style={mainStyles}>
        <MainView />
      </main>
    </React.Fragment>
  )
}

export default App
