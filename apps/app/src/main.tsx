import React from 'react'
import ReactDOM from 'react-dom'
import {QueryClient, QueryClientProvider} from 'react-query'
import './index.css'
import {akira} from '@lib/akira'
import {TaskT} from '@store/tasks/types'
import {FirebaseAuthProvider} from '@/firebase'
import App from './App'
import {onMyDayFetch} from './modules/tasks/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false
    }
  }
})

async function prefetchMyDay() {
  await queryClient.prefetchQuery('myday', akira.myday.tasks)

  const tasks = queryClient.getQueryData<TaskT[]>('myday')

  if (tasks) {
    onMyDayFetch(tasks)
  }
}

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAuthProvider onAuthSuccess={prefetchMyDay}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </FirebaseAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
