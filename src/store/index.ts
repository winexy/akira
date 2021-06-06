import {configureStore} from '@reduxjs/toolkit'
import {
  TypedUseSelectorHook,
  useDispatch as _useDispatch,
  useSelector as _useSelector
} from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import {all} from 'redux-saga/effects'
import {tasksReducer, tasksSaga} from './tasks'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  devTools: true,
  reducer: {
    tasks: tasksReducer
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware({
      thunk: false
    }).concat(sagaMiddleware)
  }
})

function* rootSaga() {
  yield all([tasksSaga()])
}

sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch

export const useDispatch = () => _useDispatch<Dispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = _useSelector
