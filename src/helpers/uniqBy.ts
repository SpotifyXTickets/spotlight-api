export function uniqBy<T>(a: T[], property: string): T[] {
  const seen: Array<{
    [key in typeof property]: string
  }> = []
  return a.filter(function (item) {
    if (!Object.prototype.hasOwnProperty.call(item, property)) {
      return true
    }

    const itemWithProperty = item as {
      [key in typeof property]: string
    }

    const hasSeen = seen.find((s) => {
      return s[property] === itemWithProperty[property]
    })

    if (hasSeen === undefined) {
      seen.push(itemWithProperty)
      return true
    }

    return false
  })
}
