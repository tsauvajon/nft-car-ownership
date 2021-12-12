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
        beforeEach(async () => {
            await contractInstance.listForRent(id, price, { from: alice })
        })

        it('ok', async () => {
            const rentalDurationMinutes = new BN(4)
            const tx = await contractInstance.rent(id, { from: bob, value: price.mul(rentalDurationMinutes) })
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                return ev._tokenId.eq(id)
                    && ev._from === alice
                    && ev._to === contractInstance.address
            })

            truffleAssert.eventEmitted(tx, 'CarRented', (ev) => {
                return ev._tokenId.eq(id)
                    && ev._rentee === alice
                    && ev._renter === bob
            })

            const blockTimestamp = await contractInstance.blockTimestamp()
            const expectedTimestamp = blockTimestamp.add(rentalDurationMinutes.muln(60))
            const rental = await contractInstance.activeRentals(id)
            expect(rental.rentee).to.equal(alice)
            expect(rental.renter).to.equal(bob)
            expect(rental.expiry.toString()).to.equal(expectedTimestamp.toString())
        })

        it('fails if not listed', async () => {
            const id = new BN(9999)
            await contractInstance.mint(alice, id)

            await truffleAssert.reverts(contractInstance.rent(id, { from: bob }), 'Not listed')
        })

        it('fails if duration is too short', async () => {
            await truffleAssert.reverts(contractInstance.rent(id, { from: bob, value: 1 }), 'Minimum rental not reached')
        })

        it('fails if an unexpected amount was paid', async () => {
            // The contract only accepts multiples of the listed price.
            await truffleAssert.reverts(contractInstance.rent(id, { from: bob, value: price.addn(3) }), 'Not a multiple of rental price')
        })
    })

    describe('end rental', () => {
        it('ok', async () => {
        })

        it('fails before expiry', async () => {
        })
    })
})
