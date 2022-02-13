export function createMatcher<T extends string>(name: string) {
  return (matcher: Record<T, string>) => {
    return (variant: T) => {
      if (variant in matcher) {
        return matcher[variant]
      }

      globalThis.console.warn(
        `[Matcher] unknown "${variant}" variant for "${name}" matcher`,
      )

      return ''
    }
  }
}
