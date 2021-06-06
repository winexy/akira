// eslint-disable-next-line
import * as CSS from 'csstype'

declare module 'react' {
  interface CSSProperties extends CSS.Properties<string | number> {
    ['--tw-translate-x']?: string
  }
}
