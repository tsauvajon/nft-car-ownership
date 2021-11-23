<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <AccountConnector msg="Welcome to Your Vue.js + TypeScript App" />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import AccountConnector from "./components/AccountConnector.vue";
import { ActionTypes } from "@/store/actions";

@Options({
  components: {
    AccountConnector,
  },
})
export default class App extends Vue {
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
