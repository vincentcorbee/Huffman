export type FrequentieTable = Record<string, number>

export type IntermediaryNode = [string, number, Node[]]

export type LeafNode = [string, number]

export type Node = IntermediaryNode | LeafNode

export type HuffmanTree = [IntermediaryNode]

export type Encoding = number[]

export type EncodedData = number[]

export type EncodingTable = Record<string, Encoding>