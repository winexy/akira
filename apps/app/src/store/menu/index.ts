import {createSlice} from '@reduxjs/toolkit'
import {RootState} from '..'

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    isOpen: false
  },
  reducers: {
    openMenu(state) {
      state.isOpen = true
    },
    closeMenu(state) {
      state.isOpen = false
    },
    toggleMenu(state) {
      state.isOpen = !state.isOpen
    }
  }
})

export const selectIsMenuOpen = (state: RootState) => state.menu.isOpen

export const {openMenu, closeMenu, toggleMenu} = menuSlice.actions

export const menuReducer = menuSlice.reducer
