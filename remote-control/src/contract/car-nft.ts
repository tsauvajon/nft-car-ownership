import { Contract, ContractSendMethod } from "web3-eth-contract";
import { useToast } from "vue-toastification";

const toast = useToast();

// Defined in this repo in `/nft/contracts`
interface Methods {
  mint(account: string, tokenID: number): ContractSendMethod;
  balanceOf(account: string): ContractSendMethod;
  tokenOfOwnerByIndex(account: string, index: number): ContractSendMethod;
}

export interface NFT {
  id: number;
}

// Call a tx, and display an error if it fails.
// Returns true if the call succeeds.
/* eslint-disable  @typescript-eslint/no-explicit-any */
async function tryCall(tx: ContractSendMethod): Promise<any> {
  try {
    return await tx.call();
  } catch (e) {
    console.error(e);
    toast.error((<Error>e).message);
  }
}

// Range returns an array of numbers from 0 to length-1.
// For example, range(3) === [0, 1, 2]
function range(length: number): Array<number> {
  return [...Array(length).keys()];
}

class CarNFT {
  contractInstance: Contract;

  constructor(contractInstance: Contract) {
    this.contractInstance = contractInstance;
  }

  methods(): Methods {
    return this.contractInstance.methods;
  }

  // Mint a new NFT, by ID.
  async mint(account: string, tokenID: number): Promise<void> {
    const tx = await this.methods().mint(account, tokenID);
    await tryCall(tx);
  }

  // Get all the NFTs of one owner.
  async getNFTs(account: string): Promise<Array<number> | undefined> {
    const balanceTx = await this.methods().balanceOf(account);

    const nftCountStr: string = await tryCall(balanceTx);

    if (nftCountStr === undefined) {
      return;
    }

    const nftCount = parseInt(nftCountStr);
    const ownedNFTs = await Promise.all(
      range(nftCount).map(async (index) => {
        const nftTx = await this.methods().tokenOfOwnerByIndex(account, index);
        return await tryCall(nftTx);
      })
    );

    return ownedNFTs;
  }
}

export default CarNFT;
