import noop from 'lodash/noop'

type Options = {
  enabled?: boolean
}

export function createDebugger(tag: string, {enabled = true}: Options = {}) {
  function log(...args: any[]) {
    if (enabled) {
      globalThis.console.debug(`[${tag}]`, ...args)
    }
  }

  log.skip = noop

  return log
}

export function Invariant(message: string) {
  return new Error(`Invariant Violation: ${message}`)
}
