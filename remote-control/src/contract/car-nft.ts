import { Contract, ContractSendMethod } from "web3-eth-contract";
import { useToast } from "vue-toastification";

const toast = useToast();

// Call a tx, and display an error if it fails.
// Returns true if the call succeeds.
async function tryCall(tx: ContractSendMethod): Promise<any> {
    try {
        return await tx.call();
    } catch (e: any) {
        console.error(e);
        toast.error(e.message);
    }
}

// Range returns an array of Numbers from 0 to length-1.
// For example, range(3) === [0, 1, 2]
function range(length: Number): Array<Number> {
    return [...Array(length).keys()]
}

class CarNFT {
    contract: Contract

    constructor(contractInstance: Contract) {
        this.contract = contractInstance
    }

    // Mint a new NFT, by ID.
    async mint(account: string, tokenID: Number): Promise<void> {
        const tx: ContractSendMethod = await this.contract.methods.mint(account, tokenID);
        await tryCall(tx);
    }

    // Get all the NFTs of one owner.
    async getNFTs(account: string): Promise<Array<Number> | undefined> {
        const balanceTx: ContractSendMethod = await this.contract.methods.balanceOf(account);
        const nftCount = await tryCall(balanceTx);

        if (nftCount === undefined) { return; }

        const ownedNFTs = await Promise.all(range(nftCount).map(async index => {
            const nftTx = await this.contract.methods.tokenOfOwnerByIndex(account, index)
            return await tryCall(nftTx);
        }))

        return ownedNFTs;
    }
}
