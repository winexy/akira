import filter from 'lodash/fp/filter'
import join from 'lodash/fp/join'

const glue = '::'

export const HotKey = {
  Meta: 0b01,
  Shift: 0b10,
  Ctrl: 0b100,
  Alt: 0b100,
  of(key: string, extra: number = 0) {
    return `${key}${glue}${extra}`
  },
  fromEvent(event: KeyboardEvent) {
    const extra =
      (event.metaKey ? HotKey.Meta : 0) |
      (event.shiftKey ? HotKey.Shift : 0) |
      (event.ctrlKey ? HotKey.Ctrl : 0) |
      (event.altKey ? HotKey.Alt : 0)

    return `${event.key}${glue}${extra}`
  },
  inspect(hotkey: string) {
    const [key, extras] = hotkey.split(glue)
    const bit = parseInt(extras, 10)

    const extrasString = join(
      '/',
      filter(Boolean, [
        (bit & HotKey.Meta) === HotKey.Meta && 'cmd',
        (bit & HotKey.Shift) === HotKey.Shift && 'shift',
        (bit & HotKey.Ctrl) === HotKey.Ctrl && 'ctrl',
        (bit & HotKey.Alt) === HotKey.Alt && 'alt',
      ]),
    )

    return `HotKey(${extrasString}${extrasString && ' '}key=${key})`
  },
}
