import {createSlice} from '@reduxjs/toolkit'
import {RootState} from '..'

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    isOpen: false
  },
  reducers: {
    openMenu(draft) {
      draft.isOpen = true
    },
    closeMenu(draft) {
      draft.isOpen = false
    },
    toggleMenu(draft) {
      draft.isOpen = !draft.isOpen
    }
  }
})

export const selectIsMenuOpen = (state: RootState) => state.menu.isOpen

export const {openMenu, closeMenu, toggleMenu} = menuSlice.actions

export const menuReducer = menuSlice.reducer
