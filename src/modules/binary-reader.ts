import { getBitCount } from "../lib"

export class BinaryReader {
  protected chunk: number
  protected pos: number
  protected bitPos: number
  protected bitCount: number

  view: DataView

  constructor(arrayBuffer: ArrayBuffer) {
    this.view = new DataView(arrayBuffer)
    this.pos = 0
    this.bitPos = -1
    this.chunk = 0
    this.bitCount = 0
  }

  protected getData(type = 'Uint8') {
    if (this.view.byteLength > this.pos) {
      this.bitPos = -1

      // @ts-ignore
      return this.view[`get${type}`](this.pos++)
    }

    throw new RangeError()
  }

  get buffer () {
    return this.view.buffer
  }

  getBytePosition() {
    return this.pos
  }

  seek(pos: number) {
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
    const bit = this.getBit()

    this.bitPos = bitPos
    this.chunk = chunk
    this.pos = pos
    this.bitCount = bitCount

    return bit
  }

  getPadSize() {
    if (this.chunk === null) {
      return 0
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

    if (this.chunk === null) return null

    const bitCount = this.bitCount
    const bit = this.bitPos >= bitCount ? 0 : (this.chunk >> this.bitPos) & 1

    this.bitPos--

    return bit
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