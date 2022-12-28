import { BinaryWriter } from '../modules'
import { EncodedData, Encoding, EncodingTable } from '../types'

const getCharacterCode = (char: string) => char.charCodeAt(0)

const mapCodeToInteger = (code: Encoding) =>
  code.reduce((acc, bit) => (acc << 1) | bit, 0)

const getByteCount = (bitCount: number) => {
  const remainder = bitCount % 8

  /* Round to whole bytes*/

  return (bitCount + (remainder ? 8 - remainder : 0)) / 8
}

const mapEncodingTable = (encodingTable: EncodingTable) => {
  let lengthEncodingTable = 0

  const entries = Object.entries(encodingTable).map(([ char, code]) => {
    const { length } = code

    /*
      We add 2 bytes for the length and character and 1 or 2 for the code depending
      on wether it's code length is bigger then 8 bits
    */

    lengthEncodingTable += 2 + (length > 8 ? 2 : 1)

    /* For each code, return a triplet [ number, number, number ] */

    return [length, getCharacterCode(char), mapCodeToInteger(code)]
  })

  return [ entries, lengthEncodingTable ] as const
}

const getPaddingSizeEncodedData = (bitCount: number) => {
  const remainder = bitCount % 8

  if (remainder) return 8 - remainder

  return 0
}

export const toArrayBuffer = (data: EncodedData, encodingTable: EncodingTable) => {
  const BYTE_COUNT_LENGTH_ENCODING_TABLE = 2
  const BYTE_COUNT_LENGTH_ENCODED_DATA = 4
  const PADDING_ENCODED_DATA = 1

  const [ entries, lengthEncodingTable ] = mapEncodingTable(encodingTable)

  const { length: bitCount } = data
  const byteCount = getByteCount(bitCount)
  const paddingSizeEncodedData = getPaddingSizeEncodedData(bitCount)

  const binaryWriter = new BinaryWriter(
    byteCount +
    BYTE_COUNT_LENGTH_ENCODING_TABLE +
    BYTE_COUNT_LENGTH_ENCODED_DATA +
    PADDING_ENCODED_DATA +
    lengthEncodingTable)

  binaryWriter.setUint16(lengthEncodingTable)

  entries.forEach(([length, charCode, code]) => {
    binaryWriter.setUint8(length)
    binaryWriter.setUint8(charCode)

    if (length > 8) binaryWriter.setUint16(code)
    else binaryWriter.setUint8(code)
  })

  let chunk = 0
  let index = 0

  binaryWriter.setUint32(byteCount)
  binaryWriter.setUint8(paddingSizeEncodedData)

  while (index < bitCount) {
    if (index % 8 === 0 && index !== 0) {
      binaryWriter.setUint8(chunk)

      chunk = 0
    }

    /* Shift chunk one bit to the left and add current bit */

    chunk = (chunk << 1) | data[index]

    index++
  }

  if (chunk) {
    /* We add padding to fill out the last chunk to a whole byte */

    for (let padding = 0; padding < paddingSizeEncodedData; padding++) chunk = chunk << 1

    binaryWriter.setUint8(chunk)
  }

  return binaryWriter.buffer
}