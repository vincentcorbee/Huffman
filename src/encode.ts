import { createFrequentieTable, createHuffmanTree, createEncodingTable, encodeData, toArrayBuffer } from './lib'

export const encode = (input: string) => {
  const frequentieTable = createFrequentieTable(input)
  const huffmanTree = createHuffmanTree(frequentieTable)
  const encodingTable = createEncodingTable(frequentieTable, huffmanTree)

  const encodedData = encodeData(encodingTable)(input)

  return toArrayBuffer(encodedData, encodingTable)
}