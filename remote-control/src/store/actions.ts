import { AbstractProvider, RequestArguments } from "web3-core";
import { ActionContext, ActionTree } from "vuex";
import { MutationTypes, Mutations } from "./mutations";
import { getContract, register } from "@/ethereum/register";
import { State } from "@vue/runtime-core";
import Web3 from "web3";
import { useToast } from "vue-toastification";

const toast = useToast();
const RinkebyChainId = "0x4"; // must be in hexadecimal.

enum ActionTypes {
  CONNECT_ACCOUNT = "CONNECT_ACCOUNT",
  MINT = "MINT",
  REFRESH_NFTS = "REFRESH_NFTS",
  REGISTER_CONTRACT = "REGISTER_CONTRACT",
  REGISTER_HOOKS = "REGISTER_HOOKS",
  REGISTER_WEB3 = "REGISTER_WEB3",
  TRANSFER = "TRANSFER",
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

interface Actions {
  [ActionTypes.MINT](
    context: AugmentedActionContext,
    id: number
  ): Promise<void>;

  [ActionTypes.REGISTER_WEB3]({
    commit,
  }: AugmentedActionContext): Promise<void>;

  [ActionTypes.TRANSFER](
    context: AugmentedActionContext,
    data: { to: string; tokenID: number }
  ): Promise<void>;
}

interface EthereumProvider extends AbstractProvider {
  request(params: RequestArguments): Promise<unknown>;
  on(
    event: string,
    callback: (() => void) | ((data: Array<string>) => void)
  ): void;
}

const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.CONNECT_ACCOUNT]({ commit, dispatch, state }) {
    // TODO: store in a cookie so we don't have to connect every time
    let account;
    try {
      const accounts = await (<Web3>state.web3).eth.requestAccounts();
      // According to the Metamask documentation, it currently always returns 1 account.
      account = accounts[0];
    } catch (e) {
      toast.error((<Error>e).message);
      return;
    }

    toast.success(`Account ${account.substring(0, 6)}... connected!`);

    commit(MutationTypes.SET_ACCOUNT, { account });
    dispatch(ActionTypes.REFRESH_NFTS);
  },

  async [ActionTypes.MINT]({ dispatch, state }, id) {
    await state.contract?.mint(<string>state.account, id);

    toast.success(`Car ${id} registered`);

    dispatch(ActionTypes.REFRESH_NFTS);
  },

  async [ActionTypes.REFRESH_NFTS]({ commit, state }) {
    const nfts = await state.contract?.getNFTs(<string>state.account);

    commit(MutationTypes.SET_NFTS, { nfts });
    toast.info("NFTs refreshed!");
  },

  [ActionTypes.REGISTER_HOOKS]({ commit, dispatch, state }) {
    // Need to cast to unknown first to satisfy TypeScript.
    const provider = state.web3?.currentProvider as EthereumProvider;
    const reloadWindow = () => window.location.reload();

    // If the network changes or the user disconnects their account, reload the entire app.
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
    let contractInstance;
    try {
      contractInstance = await getContract(<Web3>state.web3);
    } catch (e) {
      console.error("register contract instance: ", e);
      commit(MutationTypes.SET_ERROR, (<Error>e).message);
    }

    commit(MutationTypes.REGISTER_CONTRACT_INSTANCE, { contractInstance });
    toast.success("Connected to the smart contract");
  },

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

    // Rinkeby = 0x4, but it's returned as 4 by Metamask.
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

  async [ActionTypes.TRANSFER]({ dispatch, state }, { to, tokenID }) {
    await state.contract?.transfer(<string>state.account, to, tokenID);

    toast.success(`Car sent to ${to.substring(0, 6)}...`);

    dispatch(ActionTypes.REFRESH_NFTS);
  },
};

export { actions, Actions, ActionTypes };
