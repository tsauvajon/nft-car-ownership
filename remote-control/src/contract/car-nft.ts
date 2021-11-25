import { Contract, ContractSendMethod, SendOptions } from "web3-eth-contract";
import { useToast } from "vue-toastification";

const toast = useToast();

// Defined in this repo in `/nft/contracts`
interface Methods {
  mint(account: string, tokenID: number): ContractSendMethod;
  balanceOf(account: string): ContractSendMethod;
  tokenOfOwnerByIndex(account: string, index: number): ContractSendMethod;
  transferFrom(from: string, to: string, tokenID: number): ContractSendMethod;
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

// Send a tx, and display an error if it fails.
// Returns true if the send succeeds.
/* eslint-disable  @typescript-eslint/no-explicit-any */
async function trySend(
  tx: ContractSendMethod,
  options: SendOptions
): Promise<any> {
  try {
    return await tx.send(options);
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
    const tx = this.methods().mint(account, tokenID);
    const result = await trySend(tx, { from: account });
    console.log("mint result", result);
  }

  // Get all the NFTs of one owner.
  async getNFTs(account: string): Promise<Array<NFT> | undefined> {
    const balanceTx = this.methods().balanceOf(account);
    const nftCountStr: string = await tryCall(balanceTx);

    if (nftCountStr === undefined) {
      return;
    }

    const nftCount = parseInt(nftCountStr);
    const ownedNFTs = await Promise.all(
      range(nftCount).map(async (index) => {
        const nftTx = this.methods().tokenOfOwnerByIndex(account, index);
        return await tryCall(nftTx);
      })
    );

    // TODO: use BN.js
    return ownedNFTs.map((id) => ({ id: parseInt(id) }));
  }

  async transfer(from: string, to: string, tokenID: number): Promise<void> {
    const tx = this.methods().transferFrom(from, to, tokenID);
    return trySend(tx, { from });
  }
}

export default CarNFT;
