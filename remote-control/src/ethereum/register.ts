import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import detectEthereumProvider from "@metamask/detect-provider";
import { AbstractProvider } from "web3-core";
import CarNftOutput from "../../../nft/build/contracts/CarNFT.json";

const CarNFTContractMetadata = CarNftOutput as ContractMetadata;

declare global {
  interface Window {
    web3: Web3; // Injected by us to help with debugging.
    contractInstance: Contract; // Injected by us to help with debugging.
  }
}

interface ContractMetadata {
  abi: Array<AbiItem>;
  networks: {
    [network: number]: {
      address: string;
    };
  };
}

async function register(): Promise<{ web3: Web3 }> {
  const ethereum = await detectEthereumProvider({ mustBeMetaMask: true });
  if (ethereum === undefined) {
    throw new Error("Please install Metamask");
  }

  const web3: Web3 = new Web3(<AbstractProvider>ethereum);
  window.web3 = web3; // set it in the window object to help with debugging

  return { web3 };
}

async function getContract(web3: Web3): Promise<Contract> {
  if (!web3) {
    throw new Error("missing parameter web3");
  }

  // The contract needs to be deployed to the network we're logged in!
  const network = web3.eth.net;
  const networkID = await network.getId();

  let address: string;
  try {
    address = CarNFTContractMetadata.networks[networkID].address;
  } catch (e) {
    console.error(e);
    throw new Error("The contract is not deployed!");
  }

  const carNFT = new web3.eth.Contract(CarNFTContractMetadata.abi, address);
  window.contractInstance = carNFT;

  return carNFT;
}

export { register, getContract };
