<template>
  <div class="hello">
    <button @click="connectAccount">Connect your account</button>
  </div>
</template>

<script lang="ts">
import { ActionTypes } from "@/store/actions";
import { Vue } from "vue-class-component";

export default class AccountConnector extends Vue {
  async connectAccount(): Promise<void> {
    await this.$store.dispatch(ActionTypes.CONNECT_ACCOUNT);
  }
}
</script>
