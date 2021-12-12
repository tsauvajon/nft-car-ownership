const Rental = artifacts.require('Rental')
const { expect } = require('chai')
const truffleAssert = require('truffle-assertions')
const BN = require('bn.js')

contract('Rental', (accounts) => {
    [alice, bob] = accounts
    let contractInstance
    const id = new BN(123)
    const price = new BN(12345)

    beforeEach(async () => {
        contractInstance = await Rental.new()
        await contractInstance.mint(alice, id)
    })

    describe('lists a car for rent', async () => {
        it('ok', async () => {
            const tx = await contractInstance.listForRent(id, price, { from: alice })

            truffleAssert.eventEmitted(tx, 'Approval', (ev) => {
                console.log(ev._approved, contractInstance.address)
                return ev._owner === alice && ev._tokenId.eq(id) && ev._approved === contractInstance.address
            })
            truffleAssert.eventEmitted(tx, 'CarListedForRent', (ev) => {
                return ev._tokenId.eq(id) && ev._price.eq(price)
            })
        })

        it('fails if already listed', async () => {
            await contractInstance.listForRent(id, price, { from: alice })
            await truffleAssert.reverts(contractInstance.listForRent(id, price, { from: alice }), 'Car is listed for rent')
        })

        it('fails if not owner', async () => {
            await truffleAssert.reverts(contractInstance.listForRent(id, price, { from: bob }), 'revert 003003')
        })
    })

    describe('rent a car', () => {
        it('ok', async () => {
        })

        it('fails if not listed', async () => {
        })

        it('fails if duration is too short', async () => {
        })

        it('refunds if too much money was given', async () => {

        })
    })

    describe('end rental', () => {
        it('ok', async () => {
        })

        it('fails before deadline', async () => {
        })
    })
})
