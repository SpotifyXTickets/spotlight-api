import { uniqBy } from './uniqBy'

describe('uniqBy', () => {
  it('should return an array with unique objects based on the specified property', () => {
    const input = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'John' },
      { id: 4, name: 'Jane' },
    ]

    const expectedOutput = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]

    const result = uniqBy(input, 'name')

    expect(result).toEqual(expectedOutput)
  })
})
