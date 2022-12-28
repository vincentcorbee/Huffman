import { FrequentieTable, HuffmanTree, IntermediaryNode, Node } from '../types'

const getNewIndex = (entries: Node[], count: number) => {
  let index = entries.length - 1

  while(index > 0) {
    if (count <= entries[index][1]) return index

    index--
  }

  return 0
}

const getSortedEntries = (frequentieTable: FrequentieTable): Node[] =>
  Object.entries(frequentieTable).sort((a, b) => b[1] - a[1])

export const createHuffmanTree = (frequentieTable: FrequentieTable): HuffmanTree => {
  const entries = getSortedEntries(frequentieTable)

  while(entries.length > 1) {
    const left = entries.pop() as Node
    const right = entries.pop() as Node

    const [charLeft, countLeft] = left
    const [charRight, countRight] = right

    const newCount = countLeft + countRight
    const newIndex = getNewIndex(entries, newCount)

    const intermediaryNode: IntermediaryNode = [`${charLeft}${charRight}`, newCount, [left, right]]

    entries.splice(newIndex, 0, intermediaryNode)
  }

  return entries as HuffmanTree
}