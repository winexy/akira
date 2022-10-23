// eslint-disable-next-line
import * as CSS from 'csstype'

declare module 'react' {
  interface CSSProperties extends CSS.Properties<string | number> {
    ['--tw-translate-x']?: string
    ['--tw-blur']?: string
    ['--ui-fade-enter-duration']?: string
    ['--ui-fade-exit-duration']?: string
    ['--ui-scale-enter-duration']?: string
    ['--ui-scale-exit-duration']?: string
    ['--ui-scale-from']?: number
    ['--ui-scale-to']?: number
    ['--ui-shift-enter-duration']?: string
    ['--ui-shift-exit-duration']?: string
    ['--ui-shift-translate-y']?: string | number
    ['--ui-shift-translate-x']?: string | number
  }
}
