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
import { NFT as CarNFT } from "@/contract/car-nft";
import axios from "axios";

interface SignedPayload {
  data: string;
  owner: string;
}

@Options({
  props: {
    id: Number,
  },
})
export default class NFT extends Vue {
  id!: number;
  sendToAddress = "";
  nonce = 0;

  get nft(): CarNFT | null {
    return { id: this.id };
  }

  // Send the NFT.
  async send(): Promise<void> {
    return await this.$store.dispatch(ActionTypes.TRANSFER, {
      to: this.sendToAddress.trim(),
      tokenID: this.id,
    });
  }

  // Build and sign an action payload.
  async sign(action: string): Promise<SignedPayload> {
    const data = JSON.stringify({
      id: this.id,
      nonce: this.nonce, // TODO: come up with a nonce strategy
      action,
    });

    this.nonce++;

    const account = this.$store.getters.account;
    const signedData = await this.$store.state.web3?.eth.personal.sign(
      data,
      account,
      ""
    );

    const payload: SignedPayload = {
      data: signedData as string,
      owner: account,
    };

    console.log(payload);
    return payload;
  }

  // Command the car to do something, by sending it a signed payload.
  async command(action: string): Promise<void> {
    try {
      const payload = await this.sign(action);

      const resp = await axios.post(
        `http://127.0.0.1:8081/api/${action}`,
        payload
      );
      if (resp.status !== 200) {
        console.error(resp.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Open the car
  async open(): Promise<void> {
    await this.command("open");
  }

  // Close the car
  async close(): Promise<void> {
    await this.command("close");
  }
}
</script>
