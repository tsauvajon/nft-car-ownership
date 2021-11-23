import { State } from "@vue/runtime-core";
import { Store } from "vuex";
import Web3 from "web3";
import CarNFT, { NFT } from "@/contract/car-nft";

declare module "@vue/runtime-core" {
  interface State {
    web3: Web3 | null;
    error: string | null;
    account: string | null;
    contract: CarNFT | null;
    nfts: Array<NFT> | null;
  }

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

const state: State = {
  web3: null,
  error: null,
  account: null,
  contract: null,
  nfts: null,
};

export { state };
