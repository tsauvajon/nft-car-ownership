<template>
  <div>
    <div v-for="nft in nfts" :key="nft.id">
      Car #{{ nft.id }}<br />
      <button>Open</button> - <button>Close</button><br />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { NFT } from "@/contract/car-nft";

@Options({
  props: {
    msg: String,
  },
})
export default class AccountConnector extends Vue {
  msg!: string;

  get nfts(): Array<NFT> | null {
    return this.$store.getters.nfts;
  }
}
</script>
