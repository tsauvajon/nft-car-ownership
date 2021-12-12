const Rental = artifacts.require('Rental')
const { expect } = require('chai')
const truffleAssert = require('truffle-assertions')
const BN = require('bn.js')
const { time } = require('@openzeppelin/test-helpers')

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
            const previousBalance = new BN(await web3.eth.getBalance(alice))

            const rentalDurationMinutes = new BN(4)
            const value = price.mul(rentalDurationMinutes)
            const tx = await contractInstance.rent(id, { from: bob, value })

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

            const balance = await web3.eth.getBalance(alice)
            expect(balance.toString()).to.equal(previousBalance.add(value).toString())
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
        const rentalDurationMinutes = new BN(4)

        beforeEach(async () => {
            await contractInstance.listForRent(id, price, { from: alice })
            await contractInstance.rent(id, { from: bob, value: price.mul(rentalDurationMinutes) })
        })

        it('ok', async () => {
            const rental = await contractInstance.activeRentals(id)
            await time.increaseTo(rental.expiry)
            const tx = await contractInstance.endRental(id, { from: alice })

            truffleAssert.eventEmitted(tx, 'CarRentalEnded', (ev) => {
                return ev._tokenId.eq(id)
                    && ev._rentee === alice
                    && ev._renter === bob
            })
        })

        it('fails before expiry', async () => {
            // Rental beginning
            await truffleAssert.reverts(contractInstance.endRental(id, { from: alice }), 'Rental is not finished')

            // 1 second before the end of the rental
            const rental = await contractInstance.activeRentals(id)
            await time.increaseTo(rental.expiry.subn(1))
            await truffleAssert.reverts(contractInstance.endRental(id, { from: alice }), 'Rental is not finished')
        })

        it('fails if the car is not rented', async () => {
            const id = new BN(9876123)
            await contractInstance.mint(alice, id)
            await contractInstance.listForRent(id, price, { from: alice })
            await truffleAssert.reverts(contractInstance.endRental(id, { from: alice }), 'Car is not rented')
        })

        it('fails if not the original owner of the NFT', async () => {
            await time.increase(rentalDurationMinutes.muln(60))
            await truffleAssert.reverts(contractInstance.endRental(id, { from: bob }), 'revert 003007')
        })
    })
})
