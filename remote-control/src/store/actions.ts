import { State } from "@vue/runtime-core";
import { ActionContext, ActionTree } from "vuex";
import { useToast } from "vue-toastification";
import { register } from "@/ethereum/register";
import { Mutations, MutationTypes } from "./mutations";

const toast = useToast();
const RinkebyChainId = "0x4"; // must be in hexadecimal

enum ActionTypes {
  REGISTER_WEB3 = "REGISTER_WEB3",
  REGISTER_HOOKS = "REGISTER_HOOKS",
  REGISTER_CONTRACT = "REGISTER_CONTRACT",
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

interface Actions {
  [ActionTypes.REGISTER_WEB3]({
    commit,
  }: AugmentedActionContext): Promise<void>;
}

interface Provider {
  request(params: { method: string; params: Array<unknown> }): void;
}

const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.REGISTER_WEB3]({ commit, dispatch, state }) {
    let result;
    try {
      result = await register();
      commit(MutationTypes.REGISTER_WEB3_INSTANCE, result);
      toast.success("Connected to Metamask!");
    } catch (e) {
      console.error("register web3: ", e);
      commit(MutationTypes.SET_ERROR, (<Error>e).message);

      throw e;
    }

    const eth = state.web3?.eth;
    if (!eth) {
      return;
    }

    dispatch(ActionTypes.REGISTER_HOOKS);

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

    dispatch(ActionTypes.REGISTER_CONTRACT);
  },

  [ActionTypes.REGISTER_HOOKS]() {
    1 + 1;
  },

  [ActionTypes.REGISTER_CONTRACT]() {
    1 + 1;
  },
};

export { actions, Actions, ActionTypes };
