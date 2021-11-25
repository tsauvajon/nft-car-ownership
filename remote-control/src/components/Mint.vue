<template>
  <div>
    <input type="number" placeholder="car ID" v-model="id" />
    <button @click="mint">Mint NFT for car</button>
    (you need to be the car manufacturer!)
  </div>
</template>

<script lang="ts">
import { ActionTypes } from "@/store/actions";
import { NFT } from "@/contract/car-nft";
import { Vue } from "vue-class-component";

export default class AccountConnector extends Vue {
  id: number | null = null;

  get nfts(): Array<NFT> | null {
    return this.$store.getters.nfts;
  }

  async mint(): Promise<void> {
    await this.$store.dispatch(ActionTypes.MINT, this.id);
  }
}
</script>
