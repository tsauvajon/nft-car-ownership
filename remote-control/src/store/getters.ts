import CarNFT, { NFT } from "@/contract/car-nft";
import { GetterTree } from "vuex";
import { State } from "./state";

export type Getters = {
  nfts(state: State): Array<NFT> | null;
  isConnected(state: State): boolean;
  account(state: State, getters: Getters): string;
  contract(state: State): CarNFT;
};

export const getters: GetterTree<State, State> & Getters = {
  nfts: (state) => {
    return state.nfts;
  },

  isConnected: (state) => {
    return !!state.account && !!state.contract;
  },

  account: (state, getters) => {
    if (!getters.isConnected) {
      throw new Error("not connected, don't call this");
    }

    return state.account as unknown as string;
  },

  contract: (state) => {
    if (!getters.isConnected) {
      throw new Error("not connected, don't call this");
    }

    return state.contract as unknown as CarNFT;
  },
};
