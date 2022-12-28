import { EncodingTable, HuffmanTree, Node, Encoding, FrequentieTable } from '../types'

const traverseHuffmanTree = (node: Node, char: string, encoding: Encoding = []): Encoding => {
  /* We don't need the count, so will only be using the characters and children */
  const [characters, _count, children] = node

  if (char === characters) return encoding

  if (children) {
    const [left, right] = children

    /* If left node matches go left and add 0 to the encoding */
    if (left[0].includes(char)) return traverseHuffmanTree(left, char, [...encoding, 0])

    /* If right node matches go right and add 1 to the encoding */
    if (right[0].includes(char)) return traverseHuffmanTree(right, char, [...encoding, 1])
  }

  throw Error(`No match found for: ${char}`)
}

const getCharacterEncoding = (huffmanTree: HuffmanTree) => (char: string) => {
  const [rootNode] = huffmanTree

  return traverseHuffmanTree(rootNode, char)
}

export const createEncodingTable = (frequentieTable: FrequentieTable, huffmanTree: HuffmanTree): EncodingTable =>
  Object.keys(frequentieTable).reduce((table, char) => {
    table[char] = getCharacterEncoding(huffmanTree)(char)

    return table
  }, {} as EncodingTable)