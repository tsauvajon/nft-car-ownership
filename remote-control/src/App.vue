<template>
  <img alt="Vue logo" src="@/assets/logo.png" />
  <template v-if="isConnected">
    <Mint />
    <NFTs />
  </template>
  <AccountConnector v-else msg="Welcome to Your Vue.js + TypeScript App" />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AccountConnector from "@/components/AccountConnector.vue";
import { ActionTypes } from "@/store/actions";
import Mint from "@/components/Mint.vue";
import NFTs from "@/components/NFTs.vue";

@Options({
  components: {
    AccountConnector,
    Mint,
    NFTs,
  },
})
export default class App extends Vue {
  get isConnected(): boolean {
    return this.$store.getters.isConnected;
  }

  async beforeCreate(): Promise<void> {
    await this.$store.dispatch(ActionTypes.REGISTER_WEB3);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
