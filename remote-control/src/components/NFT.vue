<template>
  <div>
    Car #{{ id }}<br />
    <button @click="open">Open</button> - <button @click="close">Close</button
    ><br />
    <input v-model="sendToAddress" placeholder="0x..." /><button @click="send">
      Send
    </button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ActionTypes } from "@/store/actions";
import { NFT } from "@/contract/car-nft";
import axios from "axios";

@Options({
  props: {
    id: Number,
  },
})
export default class AccountConnector extends Vue {
  id!: number;
  sendToAddress = "";

  get nft(): NFT | null {
    return { id: this.id };
  }

  // Send the NFT
  async send(): Promise<void> {
    return await this.$store.dispatch(ActionTypes.TRANSFER, {
      to: this.sendToAddress.trim(),
      tokenID: this.id,
    });
  }

  // Open the car
  async open(): Promise<void> {
    try {
      const resp = await axios.post("http://127.0.0.1:8081/api/open");
      if (resp.status !== 200) {
        console.error(resp.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Close the car
  async close(): Promise<void> {
    const resp = await axios.post("http://127.0.0.1:8081/api/close");
    if (resp.status !== 200) {
      console.error(resp.data);
    }
  }
}
</script>
