import { FrequentieTable } from '../types'

export const createFrequentieTable = (input: string) => {
  const frequentieTabel: FrequentieTable = {}

  for (let i = 0, l = input.length; i < l; i++) {
    const char = input.charAt(i)

    if (frequentieTabel[char] !== undefined) {
      frequentieTabel[char] ++
    } else {
      frequentieTabel[char] = 1
    }
  }

  return frequentieTabel
}