import last from 'lodash/fp/last'
import {app} from '@store/app'

type Sheet = {
  index: number
  name: string
}

export const showBottomSheet = app.event<string>()
export const hideBottomSheet = app.event<string | undefined>()

export const $bottomSheets = app
  .store<Sheet[]>([])
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
