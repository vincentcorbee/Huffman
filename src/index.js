// const text = `Huffman coding uses a specific method for choosing the representation for each symbol, resulting in a prefix code (sometimes called "prefix-free codes", that is, the bit string representing some particular symbol is never a prefix of the bit string representing any other symbol). Huffman coding is such a widespread method for creating prefix codes that the term "Huffman code" is widely used as a synonym for "prefix code" even when such a code is not produced by Huffman's algorithm.`

// const text = 'Hello world!'

const text = `You should call this method whenever you're ready to update your animation onscreen. This will request that your animation function be called before the browser performs the next repaint. The number of callbacks is usually 60 times per second, but will generally match the display refresh rate in most web browsers as per W3C recommendation. requestAnimationFrame() calls are paused in most browsers when running in background tabs or hidden <iframe>s in order to improve performance and battery life.

The callback method is passed a single argument, a DOMHighResTimeStamp, which indicates the current time (based on the number of milliseconds since time origin). When multiple callbacks queued by requestAnimationFrame() begin to fire in a single frame, each receives the same timestamp even though time has passed during the computation of every previous callback's workload (in the code example below we only animate the frame when the timestamp changes, i.e. on the first callback). This timestamp is a decimal number, in milliseconds, but with a minimal precision of 1ms (1000 µs).`

class BinaryReader {
  constructor(arrayBuffer) {
    this.view = new DataView(arrayBuffer)
    this.pos = 0
    this.bit_pos = -1
    this.chunk = null
    this.bit_count = 0
    // this.bits_read = 0
  }

  seek(pos) {
    const old_pos = this.pos
    this.pos = pos

    return old_pos
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
    const bit_pos = this.bit_pos
    const bit_count = this.bit_count
    // const bits_read = this.bits_read
    const bit = this.getBit()

    this.bit_pos = bit_pos
    this.chunk = chunk
    this.pos = pos
    this.bit_count = bit_count
    // this.bits_read = bits_read

    return bit
  }

  getPadSize() {
    if (this.chunk === null) {
      return null
    } else {
      const bit_count = getBitCount(this.chunk)

      return 8 - bit_count
    }
  }

  getBitPos() {
    return getBitCount(this.chunk) - 1 + this.getPadSize()
  }

  getBit() {
    if (this.bit_pos === -1) {
      this.chunk = this.getData()

      this.bit_pos = this.getBitPos()
      this.bit_count = getBitCount(this.chunk)
    }

    if (this.chunk === null) {
      return null
    }

    const bit_count = this.bit_count
    const bit = this.bit_pos >= bit_count ? 0 : (this.chunk >> this.bit_pos) & 1

    this.bit_pos--

    //  this.bits_read ++

    return bit
  }

  getData(type = 'Uint8') {
    if (this.view.byteLength > this.pos) {
      this.bit_pos = -1

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

const getIndex = (items, count) => {
  let i = items.length - 1

  while (i > 0) {
    if (count <= items[i][1]) {
      return i
    }

    i--
  }

  return 0
}

const getEncoding = (items, char) => {
  const [start_node] = items

  const traverse = (node, char, encoding = []) => {
    const [str, count, nodes] = node

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

  return traverse(start_node, char)
}

const createHuffmanTree = items => {
  let i = 0

  while (items.length > 1) {
    const a = items.pop()
    const b = items.pop()

    const [char_a, count_a] = a
    const [char_b, count_b] = b
    const new_count = count_a + count_b
    const new_index = getIndex(items, new_count)
    const internal_node = [`${char_a}${char_b}`, new_count, [a, b]]

    items.splice(new_index, 0, internal_node)

    i += 2
  }

  return items
}

const getBitCount = number => {
  let bit_count = 0

  while (number) {
    number >>= 1
    bit_count++
  }

  return bit_count
}

const decode = buffer => {
  const br = new BinaryReader(buffer)
  const decoded_data = []

  const header_length = br.getUint16()
  const header = ['', 0, []]
  let i = 0

  while (i < header_length) {
    let length = br.getUint8()
    let index = length - 1
    const char = String.fromCharCode(br.getUint8())
    const code = length > 8 ? br.getUint16() : br.getUint8()

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

    i += 1 + 1 + (length > 8 ? 2 : 1)
  }

  // console.log(header)

  br.seek(header_length + 2)

  // First 4 bytes are length of the encoded data
  const length = br.getUint32()
  let bits_read = 0

  const traverse = (node, br) => {
    if (bits_read > length) return ''

    const nodes = node[2]

    if (!nodes) return node[0]

    const bit = br.getBit()

    bits_read++

    if (bit !== null) {
      if (nodes) {
        return traverse(nodes[bit], br)
      } else {
        return node[0]
      }
    } else {
      return ''
    }
  }

  while (bits_read < length && br.peakBit() !== null) {
    decoded_data.push(traverse(header, br))
  }

  return decoded_data
}

const getByteCount = bit_count => {
  const remainder = bit_count % 8
  const byte_count = (bit_count + (remainder ? 8 - remainder : 0)) / 8

  return byte_count
}

const toArrayBuffer = (data, enc_table) => {
  let c2 = 0

  const entries = Object.entries(enc_table).map(([char, code]) => {
    const l = code.length

    c2 += 1 + 1 + (l > 8 ? 2 : 1)

    return [l, char.charCodeAt(0), code.reduce((acc, bit) => (acc << 1) | bit, 0)]
  })

  const bit_count = data.length
  const byte_count = getByteCount(bit_count)
  const buffer = new ArrayBuffer(byte_count + 6 + c2)
  const view = new DataView(buffer)
  let offset = 0

  view.setUint16(0, c2)

  entries.forEach(([length, char_code, code], i) => {
    view.setUint8(i * 3 + 2 + offset, length)
    view.setUint8(i * 3 + 2 + 1 + offset, char_code)

    if (length > 8) {
      view.setUint16(i * 3 + 2 + 2 + offset, code)

      offset++
    } else {
      view.setUint8(i * 3 + 2 + 2 + offset, code)
    }
  })

  let chunk = 0
  let count = 6 + c2
  let i = 0

  // Store encoded length as uint32
  view.setUint32(c2 + 2, bit_count)

  while (data.length) {
    if (i % 8 === 0 && i !== 0) {
      view.setUint8(count, chunk)
      count++
      chunk = 0
    }

    const bit = data.shift()

    chunk = (chunk << 1) | bit

    i++
  }

  if (chunk) {
    const c = getBitCount(chunk)

    // Pad last chunk if not 8 bits
    let padding = 8 - c - (bit_count - (8 * (count - 6 - c2) + c))

    while (padding > 0) {
      chunk = chunk << 1

      padding--
    }

    view.setUint8(count, chunk)
  }

  return buffer
}

const freq_table = {}

for (let i = 0, l = text.length; i < l; i++) {
  const char = text.charAt(i)

  if (freq_table[char] !== undefined) {
    freq_table[char]++
  } else {
    freq_table[char] = 1
  }
}

const tree = createHuffmanTree(Object.entries(freq_table).sort((a, b) => b[1] - a[1]))
const enc_table = Object.keys(freq_table).reduce((acc, char) => {
  acc[char] = getEncoding(tree, char)

  return acc
}, {})

const encoded_data = text
  .split('')
  .map(char => enc_table[char])
  .flat()
const buffer = toArrayBuffer([...encoded_data], enc_table)

const result = decode(buffer).join('')

console.log(result, result.length)

console.log(text.length)
