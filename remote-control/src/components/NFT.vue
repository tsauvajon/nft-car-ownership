<template>
  <div>
    Car #{{ id }}<br />
    <button @click="unlock">Unlock</button> - <button @click="lock">Lock</button
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
  message: string;
  signature: string;
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
    // TODO: come up with a nonce strategy (e.g. handshake with the car that gives the nonce itself).
    this.nonce++;

    const message = JSON.stringify({
      car_id: this.id,
      nonce: this.nonce,
      action,
    });

    const account = this.$store.getters.account;
    const signature = (await this.$store.state.web3?.eth.personal.sign(
      message,
      account,
      ""
    )) as string;

    const payload: SignedPayload = {
      message,
      signature,
    };

    console.log(payload);
    return payload;
  }

  // Command the car to do something, by sending it a signed payload.
  async command(action: string): Promise<void> {
    try {
      const payload = await this.sign(action);

      const resp = await axios.post(
        `http://127.0.0.1:8081/api/command`,
        payload
      );
      if (resp.status !== 200) {
        console.error(resp.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Unlock the car
  async unlock(): Promise<void> {
    await this.command("UNLOCK_DOORS");
  }

  // Lock the car
  async lock(): Promise<void> {
    await this.command("LOCK_DOORS");
  }
}
</script>
