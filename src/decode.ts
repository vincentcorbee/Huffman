import { BinaryReader } from './modules'
import { HuffmanTree, IntermediaryNode, Node } from './types'

const getDecodedData = (binaryReader: BinaryReader) => (huffmanTree: HuffmanTree, bitCountEncodedData: number) => {
  const [root] = huffmanTree

  let bitsRead = 0

  const traverse = (node: Node, binaryReader: BinaryReader): string => {
    if (bitsRead > bitCountEncodedData) return ''

    const nodes = node[2]

    if (!nodes) return node[0]

    const bit = binaryReader.getBit()

    bitsRead++

    if (bit !== null) {
      if (nodes) return traverse(nodes[bit], binaryReader)
      else return node[0]
    } else {
      return ''
    }
  }

  let decodedData = '';

  while (bitsRead < bitCountEncodedData && binaryReader.peakBit() !== null) {
    decodedData += traverse(root, binaryReader)
  }

  return decodedData
}

const decodeHuffmanTree = (binaryReader: BinaryReader): HuffmanTree => {
  const root: IntermediaryNode = ['', 0, []]

  const huffmanTreeLength = binaryReader.getUint16()

  let indexHeader = 0

  while (indexHeader < huffmanTreeLength) {
    let lengthCode = binaryReader.getUint8()
    let indexCode = lengthCode - 1

    const char = String.fromCharCode(binaryReader.getUint8())
    const code = lengthCode > 8 ? binaryReader.getUint16() : binaryReader.getUint8()

    let entry: Node = root

    while (indexCode > -1) {
      const bit = (code >> indexCode) & 1

      entry[0] += char
      entry[1] += 1

      const nodes = entry[2] as Node[]
      const node = nodes[bit]

      if (node) {
        if (indexCode === 0) {
          nodes[bit] = [char, 1]
        } else {
          entry = node
        }
      } else if (indexCode === 0) {
        nodes[bit] = [char, 1]
      } else {
        const newEntry: IntermediaryNode = ['', 0, []]

        nodes[bit] = newEntry

        entry = newEntry
      }

      indexCode--
    }

    indexHeader += 2 + (lengthCode > 8 ? 2 : 1)
  }

  return [root]
}

const getBitCountEncodedData = (byteCountEncodedData: number, paddingSizeEncodedData: number) => byteCountEncodedData * 8 - paddingSizeEncodedData

export const decode = (buffer: ArrayBuffer) => {
  const binaryReader = new BinaryReader(buffer)

  const huffmanTree = decodeHuffmanTree(binaryReader)

  const byteCountEncodedData = binaryReader.getUint32()
  const paddingSizeEncodedData = binaryReader.getUint8()

  return getDecodedData(binaryReader)(huffmanTree, getBitCountEncodedData(byteCountEncodedData, paddingSizeEncodedData))
}