// build-setcontenthash-tx.mjs — compute the exact ENS setContenthash transaction
// for supercompute.eth so Mario can sign it in MetaMask with one click.
import { encodeFunctionData, namehash } from 'viem'

const RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' // verified ENS PublicResolver (mainnet)
const CONTENTHASH = '0xe3012801720024080112204769819b0779cb99374a745ab2d022a05433fd5cc6d41894b58f56fa417c6740'
const NODE = namehash('supercompute.eth')

const abi = [
  {
    type: 'function',
    name: 'setContenthash',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'hash', type: 'bytes' },
    ],
    outputs: [],
  },
]

const data = encodeFunctionData({ abi, functionName: 'setContenthash', args: [NODE, CONTENTHASH] })

console.log(JSON.stringify({
  to: RESOLVER,
  data,
  node: NODE,
  contenthash: CONTENTHASH,
  description: 'setContenthash on supercompute.eth → ipns://5AanNVJCxnKe9WWpFKxkhN1fMkEzwbWiB3EDWwsm2yYyeTiL4oW88f',
}, null, 2))
