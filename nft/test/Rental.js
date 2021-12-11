const Rental = artifacts.require('Rental')
const { expect } = require('chai')
const truffleAssert = require('truffle-assertions')
const BN = require('bn.js')

contract('Rental', (accounts) => {
    [alice, bob] = accounts
    let contractInstance

    beforeEach(async () => {
        contractInstance = await Rental.new()
    })

    describe('lists a car for rent', async () => {
        it('ok', async () => {
        })

        it('fails if already listed', async () => {
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
