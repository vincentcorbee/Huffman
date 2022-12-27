// const text = `Huffman coding uses a specific method for choosing the representation for each symbol, resulting in a prefix code (sometimes called "prefix-free codes", that is, the bit string representing some particular symbol is never a prefix of the bit string representing any other symbol). Huffman coding is such a widespread method for creating prefix codes that the term "Huffman code" is widely used as a synonym for "prefix code" even when such a code is not produced by Huffman's algorithm.`

// const text = 'Hello world!'

const text = `You should call this method whenever you're ready to update your animation onscreen. This will request that your animation function be called before the browser performs the next repaint. The number of callbacks is usually 60 times per second, but will generally match the display refresh rate in most web browsers as per W3C recommendation. requestAnimationFrame() calls are paused in most browsers when running in background tabs or hidden <iframe>s in order to improve performance and battery life.

The callback method is passed a single argument, a DOMHighResTimeStamp, which indicates the current time (based on the number of milliseconds since time origin). When multiple callbacks queued by requestAnimationFrame() begin to fire in a single frame, each receives the same timestamp even though time has passed during the computation of every previous callback's workload (in the code example below we only animate the frame when the timestamp changes, i.e. on the first callback). This timestamp is a decimal number, in milliseconds, but with a minimal precision of 1ms (1000 µs).`

const text2 = 'abracadabra'

class BinaryReader {
  constructor(arrayBuffer) {
    this.view = new DataView(arrayBuffer)
    this.pos = 0
    this.bitPos = -1
    this.chunk = null
    this.bitCount = 0
    // this.bitsRead = 0
  }

  get buffer () {
    return this.view.buffer
  }

  getBytePosition() {
    return this.pos
  }

  seek(pos) {
    const oldPos = this.pos

    this.pos = pos

    return oldPos
  }

  peak(index = this.pos + 1) {
    if (this.view.byteLength > index && index > -1) {
      return this.view.getUint8(index)
    }

    return null
  }

  peakBit() {
    const chunk = this.chunk
    const pos = this.pos
    const bitPos = this.bitPos
    const bitCount = this.bitCount
    // const bitsRead = this.bitsRead
    const bit = this.getBit()

    this.bitPos = bitPos
    this.chunk = chunk
    this.pos = pos
    this.bitCount = bitCount
    // this.bitsRead = bitsRead

    return bit
  }

  getPadSize() {
    if (this.chunk === null) {
      return null
    } else {
      const bitCount = getBitCount(this.chunk)

      return 8 - bitCount
    }
  }

  getBitPos() {
    return getBitCount(this.chunk) - 1 + this.getPadSize()
  }

  getBit() {
    if (this.bitPos === -1) {
      this.chunk = this.getData()

      this.bitPos = this.getBitPos()
      this.bitCount = getBitCount(this.chunk)
    }

    if (this.chunk === null) {
      return null
    }

    const bitCount = this.bitCount
    const bit = this.bitPos >= bitCount ? 0 : (this.chunk >> this.bitPos) & 1

    this.bitPos--

    return bit
  }

  getData(type = 'Uint8') {
    if (this.view.byteLength > this.pos) {
      this.bitPos = -1

      return this.view[`get${type}`](this.pos++)
    }

    return null
  }

  getUint32() {
    return (
      (this.getData() << 24) |
      (this.getData() << 16) |
      (this.getData() << 8) |
      this.getData()
    )
  }

  getUint16() {
    return (this.getData() << 8) | this.getData()
  }

  getUint8() {
    return this.getData()
  }
}

class BinaryWriter extends BinaryReader {
  constructor(length) {
    super(new ArrayBuffer(length))

    this.length = length
  }

  setData(data, type = 'Uint8') {
    let advance = 0

    switch(type) {
      case 'Uint16':
        advance = 2
        break;
      case 'Uint32':
        advance = 4
        break;
      default:
        advance = 1
    }

    if (this.view.byteLength > this.pos) {
      this.bitPos = -1

      this.view[`set${type}`](this.pos, data)

      this.pos += advance

      return this
    }

    return this
  }

  setUint32(data) {
    return this.setData(data, 'Uint32')
  }

  setUint16(data) {
    return this.setData(data, 'Uint16')
  }

  setUint8(data) {
    return this.setData(data)
  }
}



const getIndex = (items, count) => {
  let i = items.length - 1

  while (i > 0) {
    if (count <= items[i][1]) return i

    i--
  }

  return 0
}

const getEncoding = (huffmanTree, char) => {
  const [startNode] = huffmanTree

  const traverse = (node, char, encoding = []) => {
    const [str, _count, nodes] = node

    if (char === str) {
      return encoding
    } else if (nodes) {
      const [left, right] = nodes

      if (left[0].includes(char)) {
        return traverse(left, char, [...encoding, 0])
      } else {
        return traverse(right, char, [...encoding, 1])
      }
    }
  }

  return traverse(startNode, char)
}

const createHuffmanTree = items => {
  while (items.length > 1) {
    const a = items.pop()
    const b = items.pop()

    const [char_a, count_a] = a
    const [char_b, count_b] = b

    const newCount = count_a + count_b

    const newIndex = getIndex(items, newCount)
    const internal_node = [`${char_a}${char_b}`, newCount, [a, b]]

    items.splice(newIndex, 0, internal_node)
  }

  return items
}

const getBitCount = number => {
  let bitCount = 0

  while (number) {
    number >>= 1
    bitCount++
  }

  return bitCount
}

const mapCodeToInteger = (code) =>
  code.reduce((acc, bit) => (acc << 1) | bit, 0)

const getCharacterCode = (char) => char.charCodeAt(0)

const getByteCount = bitCount => {
  const remainder = bitCount % 8

  return (bitCount + (remainder ? 8 - remainder : 0)) / 8
}

const createFrequentieTable = (input) => {
  const frequentieTable = {}

  for (let i = 0, l = input.length; i < l; i++) {
    const char = input.charAt(i)

    if (frequentieTable[char] !== undefined) {
      frequentieTable[char]++
    } else {
      frequentieTable[char] = 1
    }
  }

  return frequentieTable
}

const toArrayBuffer = (data, encodingTable) => {
  /* Two bytes for the length of the encoding table, four bytes for the bit count of the encoded data  */
  const LENGTH_HEADER_OFFSET = 6

  let lengthEncodingTable = 0

  const entries = Object.entries(encodingTable).map(([char, code]) => {
    const { length } = code

    /*
      We add 2 bytes for the length and character and 1 or 2 for the code depending
      on wether it's code length is bigger then 8 bits
    */

    lengthEncodingTable += 2 + (length > 8 ? 2 : 1)

    return [length, getCharacterCode(char), mapCodeToInteger(code)]
  })

  const bitCount = data.length
  const byteCount = getByteCount(bitCount)
  const padCountEncodedData = bitCount % 8

  const binaryWriter = new BinaryWriter(byteCount + LENGTH_HEADER_OFFSET + lengthEncodingTable)

  const buffer = new ArrayBuffer(byteCount + LENGTH_HEADER_OFFSET + lengthEncodingTable)
  const dataView = new DataView(buffer)

  let offsetAdjustment = 0

  binaryWriter.setUint16(lengthEncodingTable)

  dataView.setUint16(0, lengthEncodingTable)

  entries.forEach(([length, charCode, code], i) => {
    const offset = i * 3 + 2

    binaryWriter.setUint8(length)
    binaryWriter.setUint8(charCode)

    dataView.setUint8(offset + offsetAdjustment, length)
    dataView.setUint8(offset + 1 + offsetAdjustment, charCode)

    if (length > 8) {
      binaryWriter.setUint16(code)
      dataView.setUint16(offset + 2 + offsetAdjustment, code)

      offsetAdjustment++
    } else {
      binaryWriter.setUint8(code)
      dataView.setUint8(offset + 2 + offsetAdjustment, code)
    }
  })

  let chunk = 0
  let offsetChunk = LENGTH_HEADER_OFFSET + lengthEncodingTable
  let index = 0

  // Store encoded length as uint32

  binaryWriter.setUint32(bitCount)

  dataView.setUint32(lengthEncodingTable + 2, bitCount)

  while (index < bitCount) {
    if (index % 8 === 0 && index !== 0) {
      binaryWriter.setUint8(chunk)

      dataView.setUint8(offsetChunk, chunk)

      offsetChunk++

      chunk = 0
    }

    const bit = data[index]

    chunk = (chunk << 1) | bit

    index++
  }

  if (chunk) {
    for (let pad = 0; pad <= padCountEncodedData; pad++) {
      chunk = chunk << 1
    }

    // const bitCountChunk = getBitCount(chunk)

    // Pad last chunk if not 8 bits
    // let padding = 8 - bitCountChunk - (bitCount - (8 * (offsetChunk - LENGTH_HEADER_OFFSET - lengthEncodingTable) + bitCountChunk))

    // while (padding > 0) {
    //   chunk = chunk << 1

    //   padding--
    // }

    binaryWriter.setUint8(chunk)

    dataView.setUint8(offsetChunk, chunk)
  }

  return binaryWriter.buffer
  // return buffer
}

const encode = (input) => {
  const frequentieTable = createFrequentieTable(input)
  const huffmanTree = createHuffmanTree(Object.entries(frequentieTable).sort((a, b) => b[1] - a[1]))
  const encodingTable = Object.keys(frequentieTable).reduce((acc, char) => {
    acc[char] = getEncoding(huffmanTree, char)

    return acc
  }, {})

  const encodedData  = input
    .split('')
    .flatMap(char => encodingTable[char])

  return toArrayBuffer(encodedData , encodingTable)
}

const decode = buffer => {
  const binaryReader = new BinaryReader(buffer)
  const decodedData = []

  const headerLength = binaryReader.getUint16()
  const header = ['', 0, []]

  let i = 0

  while (i < headerLength) {
    let lengthCode = binaryReader.getUint8()
    let index = lengthCode - 1

    const char = String.fromCharCode(binaryReader.getUint8())
    const code = lengthCode > 8 ? binaryReader.getUint16() : binaryReader.getUint8()

    let entry = header

    while (index > -1) {
      const bit = (code >> index) & 1

      entry[0] += char
      entry[1]++

      const nodes = entry[2]
      const node = nodes[bit]

      if (node) {
        if (index === 0) {
          nodes[bit] = [char, 1]
        } else {
          entry = node
        }
      } else if (index === 0) {
        nodes[bit] = [char, 1]
      } else {
        const new_entry = ['', 0, []]

        nodes[bit] = new_entry

        entry = new_entry
      }

      index--
    }

    i += 2 + (lengthCode > 8 ? 2 : 1)
  }

  console.log(binaryReader.getBytePosition())

  // binaryReader.seek(headerLength + 3)

  /* These 4 bytes are the length of the encoded data */

  const length = binaryReader.getUint32()

  console.log(length, headerLength)

  let bitsRead = 0

  const traverse = (node, binaryReader) => {
    if (bitsRead > length) return ''

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

  while (bitsRead < length && binaryReader.peakBit() !== null) {
    decodedData.push(traverse(header, binaryReader))
  }

  return decodedData
}

const encodedData = encode(text)

const result = decode(encodedData).join('')

console.log(encodedData.byteLength)

console.log(result, result.length)

console.log(text.length)
