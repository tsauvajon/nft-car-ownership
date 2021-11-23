import { MutationTree } from "vuex";
import Web3 from "web3";
import { State } from "@vue/runtime-core";
import { useToast } from "vue-toastification";
import CarNFT from "@/contract/car-nft";

const toast = useToast();

enum MutationTypes {
  REGISTER_WEB3_INSTANCE = "REGISTER_WEB3_INSTANCE",
  REGISTER_CONTRACT_INSTANCE = "REGISTER_CONTRACT_INSTANCE",
  SET_ACCOUNT = "SET_ACCOUNT",
  SET_ERROR = "SET_ERROR",
}

type Mutations<S = State> = {
  [MutationTypes.REGISTER_WEB3_INSTANCE](
    state: S,
    payload: { web3: Web3 }
  ): void;

  [MutationTypes.SET_ACCOUNT](state: S, payload: { account: string }): void;

  [MutationTypes.SET_ERROR](state: S, error: string): void;
};

const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.REGISTER_WEB3_INSTANCE](state, { web3 }) {
    state.web3 = web3;
  },

  [MutationTypes.REGISTER_CONTRACT_INSTANCE](state, { contractInstance }) {
    window.contractInstance = contractInstance;
    state.contract = new CarNFT(contractInstance);
  },

  [MutationTypes.SET_ACCOUNT](state, { account }) {
    state.account = account;
  },

  [MutationTypes.SET_ERROR](state, error) {
    toast.error(error);
    state.error = error;
  },
};

export { mutations, MutationTypes, Mutations };
