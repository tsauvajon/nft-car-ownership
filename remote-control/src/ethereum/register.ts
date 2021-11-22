import Web3 from 'web3'
const CarNFT = require('../../../nft/build/contracts/CarNFT.json')

let register = () => new Promise(function (resolve, reject) {
    // Metamask injects its web3 instance into window.ethereum
    const ethereum = window.ethereum
    if (typeof ethereum === 'undefined') {
        reject(new Error('Please install Metamask'))
        return
    }

    if (!ethereum.isMetaMask) {
        reject(new Error('This app only works with Metamask, but you use another wallet'))
        return
    }

    const web3: Web3 = new Web3(ethereum)
    window.web3 = web3 // set it in the window object to help with debugging

    resolve({ web3 })
})

async function getContract(web3: Web3) {
    if (!web3) {
        throw new Error('missing parameter web3')
    }

    // The contract needs to be deployed to the network we're logged in!
    const network = web3.currentProvider.networkVersion

    let address: string
    try {
        address = CarNFT.networks[network].address
    } catch (e) {
        console.error(e)
        throw new Error('The contract is not deployed!')
    }

    const carNFT = new web3.eth.Contract(CarNFT.abi, address)
    window.carNFT = carNFT

    return carNFT
}

export { register, getContract }
