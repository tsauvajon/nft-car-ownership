<template>
  <div>
    <NFT :id="nft.id" v-for="nft in nfts" :key="nft.id" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { NFT as CarNFT } from "@/contract/car-nft";
import NFT from "@/components/NFT.vue";

@Options({
  components: {
    NFT,
  },
})
export default class AccountConnector extends Vue {
  get nfts(): Array<CarNFT> | null {
    return this.$store.getters.nfts;
  }
}
</script>
