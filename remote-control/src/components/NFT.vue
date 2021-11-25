<template>
  <div>
    Car #{{ id }}<br />
    <button>Open</button> - <button>Close</button><br />
    <input v-model="sendToAddress" placeholder="0x..." /><button @click="send">
      Send
    </button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ActionTypes } from "@/store/actions";
import { NFT } from "@/contract/car-nft";

@Options({
  props: {
    id: Number,
  },
})
export default class AccountConnector extends Vue {
  id!: number;
  sendToAddress = "";

  get nft(): NFT | null {
    // TODO: get more metadata from the store when needed
    return { id: this.id };
  }

  async send(): Promise<void> {
    return await this.$store.dispatch(ActionTypes.TRANSFER, {
      to: this.sendToAddress.trim(),
      tokenID: this.id,
    });
  }
}
</script>
