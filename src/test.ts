import assert from 'assert'

import { encode, decode } from './'
import { sampleOne, sampleTwo, sampleThree } from './samples'

const encodedDataSampleOne = encode(sampleOne)
const encodedDataSampleTwo = encode(sampleTwo)
const encodedDataSampleThree = encode(sampleThree)

const decodedSampleOne = decode(encodedDataSampleOne)
const decodedSampleTwo = decode(encodedDataSampleTwo)
const decodedSampleThree = decode(encodedDataSampleThree)

assert(decodedSampleOne === sampleOne)
assert(decodedSampleTwo === sampleTwo)
assert(decodedSampleThree === sampleThree)

console.log({
  encoded: encodedDataSampleOne.byteLength,
  decoded: decodedSampleOne.length,
  orignal: sampleOne.length
})

console.log({
  encoded: encodedDataSampleTwo.byteLength,
  decoded: decodedSampleTwo.length,
  orignal: sampleTwo.length
})

console.log({
  encoded: encodedDataSampleThree.byteLength,
  decoded: decodedSampleThree.length,
  orignal: sampleThree.length
})