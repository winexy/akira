import {HotKey} from './HotKey'

describe('Hotkey.fromEvent', () => {
  it.each`
    key    | property      | expected
    ${'a'} | ${'metaKey'}  | ${HotKey.of('a', HotKey.Meta)}
    ${'b'} | ${'shiftKey'} | ${HotKey.of('b', HotKey.Shift)}
    ${'c'} | ${'ctrlKey'}  | ${HotKey.of('c', HotKey.Ctrl)}
    ${'d'} | ${'altKey'}   | ${HotKey.of('d', HotKey.Alt)}
  `(
    'should create HotKey from [$key + $property] keyboard event that equals to $expected',
    ({key, property, expected}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        [property]: true,
      })

      const def = HotKey.fromEvent(event)

      expect(def).toBe(expected)
    },
  )

  it('should combine hot key extras', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      shiftKey: true,
      metaKey: true,
    })

    const def = HotKey.fromEvent(event)

    expect(def).toBe(HotKey.of('k', HotKey.Meta | HotKey.Shift))
  })
})
