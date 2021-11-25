<template>
  <div class="hello">
    <button @click="connectAccount">Connect your account</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ActionTypes } from "@/store/actions";

@Options({
  props: {
    msg: String,
  },
})
export default class AccountConnector extends Vue {
  msg!: string;

  async connectAccount(): Promise<void> {
    await this.$store.dispatch(ActionTypes.CONNECT_ACCOUNT);
  }
}
</script>
