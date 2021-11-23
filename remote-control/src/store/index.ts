import { State } from "@vue/runtime-core";
import {
  createStore,
  ActionContext,
  ActionTree,
  MutationTree,
  Store,
} from "vuex";
import Web3 from "web3";
import { useToast } from "vue-toastification";
import { register } from "@/ethereum/register";
import CarNFT from "../contract/car-nft";

const toast = useToast();

declare module "@vue/runtime-core" {
  interface State {
    web3: Web3 | null;
    error: string | null;
    account: string | null;
    contract: CarNFT | null;
  }

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

const RinkebyChainId = "0x4"; // must be in hexadecimal

const state: State = {
  web3: null,
  error: null,
  account: null,
  contract: null,
};

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

export enum ActionTypes {
  REGISTER_WEB3 = "REGISTER_WEB3",
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

export interface Actions {
  [ActionTypes.REGISTER_WEB3]({
    commit,
  }: AugmentedActionContext): Promise<void>;
}

interface Provider {
  request(params: { method: string; params: Array<unknown> }): void;
}

const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.REGISTER_WEB3]({ commit, state }) {
    let result;
    try {
      result = await register();
      commit(MutationTypes.REGISTER_WEB3_INSTANCE, result);
      toast.success("Metamask detected!");
    } catch (e) {
      console.error("register web3: ", e);
      commit(MutationTypes.SET_ERROR, (<Error>e).message);

      throw e;
    }

    const eth = state.web3?.eth;
    if (!eth) {
      return;
    }

    // dispatch("registerHooks");

    // Rinkeby = 0x4, but it's returned as 4 by Metamask
    if ((await eth.net.getId()) !== 4) {
      commit(
        MutationTypes.SET_ERROR,
        "This application only runs on Rinkeby, please update your network on Metamask"
      );

      const provider: Provider = eth.currentProvider as Provider;
      provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RinkebyChainId }],
      });
      return;
    }

    // dispatch("registerContract");
  },
};

export default createStore({
  state,
  mutations,
  actions,
  modules: {},
});
