const CarNFT = artifacts.require('CarNFT')
const { expect } = require('chai')
const truffleAssert = require('truffle-assertions')
const BN = require('bn.js')
const { assert } = require('console')

contract('CarNFT', (accounts) => {
    [alice, bob] = accounts
    let contractInstance

    const id1 = new BN(42323)
    const id2 = new BN(123)
    const id3 = new BN(99999)

    beforeEach(async () => {
        contractInstance = await CarNFT.new()
    })

    it('mints NFTs', async () => {
        let tx = await contractInstance.mint(alice, id1)
        truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
            return ev._to === alice && ev._tokenId.eq(id1)
        })

        const balance = await contractInstance.balanceOf(alice)
        expect(balance.toNumber()).to.equal(1)

        const totalSupply = await contractInstance.totalSupply()
        expect(totalSupply.toNumber()).to.equal(1)
    })

    it('returns the correct token by index', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(alice, id2)
        await contractInstance.mint(alice, id3)

        const token1 = await contractInstance.tokenByIndex(0)
        const token2 = await contractInstance.tokenByIndex(1)
        const token3 = await contractInstance.tokenByIndex(2)

        expect(token1.toNumber()).to.equal(id1.toNumber())
        expect(token2.toNumber()).to.equal(id2.toNumber())
        expect(token3.toNumber()).to.equal(id3.toNumber())
    })

    it('throws when trying to get a non-existing token', async () => {
        await contractInstance.mint(alice, id1)
        await truffleAssert.reverts(contractInstance.tokenByIndex(999), 'revert 005007')
    })

    it('returns the correct token owner by index', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(bob, id2)
        await contractInstance.mint(bob, id3)

        const tokenID = await contractInstance.tokenOfOwnerByIndex(bob, 1)
        expect(tokenID.toNumber()).to.equal(id3.toNumber())
    })

    it('throws when trying to get a non-existing token by owner', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(bob, id2)
        await truffleAssert.reverts(contractInstance.tokenOfOwnerByIndex(alice, 1), 'revert 005007')
    })

    it('sets the data correctly when minting', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(bob, id3)
        await contractInstance.mint(bob, id2)

        expect((await contractInstance.idToOwnerIndex(id1)).toNumber()).to.equal(0)
        expect((await contractInstance.idToOwnerIndex(id3)).toNumber()).to.equal(0)
        expect((await contractInstance.idToOwnerIndex(id2)).toNumber()).to.equal(1)

        expect((await contractInstance.ownerToIdsLen(alice)).toNumber()).to.equal(1)
        expect((await contractInstance.ownerToIdsLen(bob)).toNumber()).to.equal(2)

        expect((await contractInstance.ownerToIdbyIndex(alice, 0)).toNumber()).to.equal(id1.toNumber())
        expect((await contractInstance.ownerToIdbyIndex(bob, 0)).toNumber()).to.equal(id3.toNumber())
        expect((await contractInstance.ownerToIdbyIndex(bob, 1)).toNumber()).to.equal(id2.toNumber())

        expect((await contractInstance.idToIndex(id1)).toNumber()).to.equal(0)
        expect((await contractInstance.idToIndex(id3)).toNumber()).to.equal(1)
        expect((await contractInstance.idToIndex(id2)).toNumber()).to.equal(2)
    })

    it('sets the data correctly when burning', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(bob, id2)
        await contractInstance.mint(bob, id3)

        // Burn id1
        await contractInstance.burn(id1)
        expect((await contractInstance.idToOwnerIndex(id2)).toNumber()).to.equal(0)
        expect((await contractInstance.idToOwnerIndex(id3)).toNumber()).to.equal(1)
        expect((await contractInstance.ownerToIdsLen(bob)).toNumber()).to.equal(2)
        expect((await contractInstance.ownerToIdbyIndex(bob, 0)).toNumber()).to.equal(id2.toNumber())
        expect((await contractInstance.ownerToIdbyIndex(bob, 1)).toNumber()).to.equal(id3.toNumber())

        // Burn moves the last token (id3) in place of the burnt token
        // (to change only 1 index instead of many while keeping the array filled).
        // So it changes from [id1, id2, id3] to [id3, id2]
        expect((await contractInstance.idToIndex(id3)).toNumber()).to.equal(0)
        expect((await contractInstance.idToIndex(id2)).toNumber()).to.equal(1)
        expect((await contractInstance.tokenByIndex(0)).toNumber()).to.equal(id3.toNumber())
        expect((await contractInstance.tokenByIndex(1)).toNumber()).to.equal(id2.toNumber())

        // Burn id2
        await contractInstance.burn(id2)
        expect((await contractInstance.idToOwnerIndex(id3)).toNumber()).to.equal(0)
        expect((await contractInstance.ownerToIdsLen(bob)).toNumber()).to.equal(1)
        expect((await contractInstance.ownerToIdbyIndex(bob, 0)).toNumber()).to.equal(id3.toNumber())
        expect((await contractInstance.idToIndex(id3)).toNumber()).to.equal(0)
        expect((await contractInstance.tokenByIndex(0)).toNumber()).to.equal(id3.toNumber())

        // Burn id3
        await contractInstance.burn(id3)
        expect((await contractInstance.ownerToIdsLen(bob)).toNumber()).to.equal(0)
        await truffleAssert.reverts(contractInstance.ownerToIdbyIndex(bob, 0))
    })

    it('sets the data correctly when transfering tokens', async () => {
        await contractInstance.mint(alice, id1)
        await contractInstance.mint(alice, id3)
        await contractInstance.mint(alice, id2)
        await contractInstance.transferFrom(alice, bob, id1) // { from: alice }

        expect((await contractInstance.idToOwnerIndex(id1)).toNumber()).to.equal(0)
        expect((await contractInstance.idToOwnerIndex(id3)).toNumber()).to.equal(1)
        expect((await contractInstance.idToOwnerIndex(id2)).toNumber()).to.equal(0)

        expect((await contractInstance.ownerToIdsLen(alice)).toNumber()).to.equal(2)

        expect((await contractInstance.ownerToIdbyIndex(alice, 0)).toNumber()).to.equal(id2.toNumber())
        expect((await contractInstance.ownerToIdbyIndex(alice, 1)).toNumber()).to.equal(id3.toNumber())
        await truffleAssert.reverts(contractInstance.ownerToIdbyIndex(alice, 2))

        expect((await contractInstance.ownerToIdsLen(bob)).toNumber()).to.equal(1)
        expect((await contractInstance.ownerToIdbyIndex(bob, 0)).toNumber()).to.equal(id1.toNumber())
    })

    it('fails to transfer when not approved by the owner', async () => {
        await contractInstance.mint(alice, id1)
        await truffleAssert.reverts(contractInstance.transferFrom(alice, bob, id1, { from: bob }), 'revert 003004')
    })
})
