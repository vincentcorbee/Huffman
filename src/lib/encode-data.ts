import { EncodedData, EncodingTable } from '../types'

export const encodeData = (encodingTable: EncodingTable) => (input: string): EncodedData =>
  input
    .split('')
    .flatMap(char => encodingTable[char])