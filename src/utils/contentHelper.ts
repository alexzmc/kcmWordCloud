
export const formatISO = (isoString: string): string => {
  return isoString.split('T')[0].replaceAll('-', '/')
}

export const toISO = (qString: string): string => {
  return `${qString.split('/').join('-')}T00:00:00Z`
}

export const isKeyword = (word: string): boolean => {
  if (!/^[a-zA-Z]+$/.test(word)) return false
  if (word.length <= 3) return false
  const uselessWords = [
    'the',
    'and',
    'but',
    'of',
    'for',
    'is',
    'on',
    'are',
    'that',
    'this',
    'from'
  ]
  if (uselessWords.includes(word)) return false
  else return true
}


export const breakContents = (paragraph: string): string[] => {
  const str = paragraph.replace(/<[^>]*>?/gm, '')
  const words = str.split(' ').filter(word => isKeyword(word))
  return words
}

export const reduceWords = (arrayOfStrings: string[]) => { 
  const wordCountObj = arrayOfStrings.reduce((acc: {[key: string]: { size: number, text: string}}, word: string) => {
      if (acc[word.toLowerCase()]) {
        acc[word.toLowerCase()].size += 1
      }
      else {
        acc[word.toLowerCase()] = { size: 1, text: word.toLowerCase() }
      }
      return acc
  }, {})
  return wordCountObj
}
