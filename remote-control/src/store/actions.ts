import { State } from "@vue/runtime-core";
import { ActionContext, ActionTree } from "vuex";
import { useToast } from "vue-toastification";
import { register, getContract } from "@/ethereum/register";
import { Mutations, MutationTypes } from "./mutations";
import { AbstractProvider, RequestArguments } from "web3-core";
import Web3 from "web3";

const toast = useToast();
const RinkebyChainId = "0x4"; // must be in hexadecimal

enum ActionTypes {
  REGISTER_WEB3 = "REGISTER_WEB3",
  REGISTER_HOOKS = "REGISTER_HOOKS",
  REGISTER_CONTRACT = "REGISTER_CONTRACT",
  REFRESH_NFTS = "REFRESH_NFTS",
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

interface EthereumProvider extends AbstractProvider {
  request(params: RequestArguments): Promise<unknown>;
  on(event: string, callback: (data: Array<string>) => void): void;
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

      const provider = eth.currentProvider as EthereumProvider;
      provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RinkebyChainId }],
      });
      return;
    }

    dispatch(ActionTypes.REGISTER_CONTRACT);
  },

  [ActionTypes.REGISTER_HOOKS]({ commit, dispatch, state }) {
    // Need to cast to unknown first to satisfy TypeScript.
    const provider = state.web3?.currentProvider as EthereumProvider;
    const reloadWindow = () => window.location.reload();

    // If the network changes or the user disconnects their account, reload the app
    provider.on("chainChanged", reloadWindow);
    provider.on("disconnect", reloadWindow);

    provider.on("accountsChanged", (accounts: Array<string>) => {
      // Only 1 account returned by MetaMask,
      // see https://docs.metamask.io/guide/ethereum-provider.html#events.
      const account = accounts[0];
      console.log("account changed:", account);

      commit(MutationTypes.SET_ACCOUNT, { account });
      dispatch(ActionTypes.REFRESH_NFTS);
    });
  },

  async [ActionTypes.REGISTER_CONTRACT]({ commit, state }) {
    try {
      const contractInstance = await getContract(<Web3>state.web3);
      commit(MutationTypes.REGISTER_CONTRACT_INSTANCE, { contractInstance });
      toast.success("Connected to the smart contract");
    } catch (e) {
      console.error("register contract instance: ", e);
      commit(MutationTypes.SET_ERROR, (<Error>e).message);
    }
  },
};

export { actions, Actions, ActionTypes };
