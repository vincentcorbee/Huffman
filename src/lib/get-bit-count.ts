export const getBitCount = (bits: number) => {
  let bitCount = 0

  while(bits) {
    /* Shift one bit off and assign result */

    bits >>= 1

    /* For every shift add a one to the total count */

    bitCount++
  }

  return bitCount
}