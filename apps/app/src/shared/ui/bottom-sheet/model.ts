import {createEvent, createStore} from 'effector'
import last from 'lodash/fp/last'

type Sheet = {
  index: number
  name: string
}

export const showBottomSheet = createEvent<string>()
export const hideBottomSheet = createEvent<string | undefined>()

export const $bottomSheets = createStore<Sheet[]>([])
  .on(showBottomSheet, (sheets, name) => {
    const sheet = {
      index: sheets.length + 1,
      name
    }

    return [...sheets, sheet]
  })
  .on(hideBottomSheet, (sheets, name) => {
    if (name) {
      return sheets.filter(sheet => sheet.name !== name)
    }

    return sheets.slice(0, -1)
  })

export const $activeBottomSheet = $bottomSheets.map(last)
