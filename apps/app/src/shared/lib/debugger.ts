export const createDebugger = (tag: string) => (...args: any[]) =>
  globalThis.console.debug(`[${tag}]`, ...args)
