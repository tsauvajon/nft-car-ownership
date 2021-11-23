<template>
  <div class="hello">
    <button @click="connectAccount">Connect your account</button>
  </div>
</template>

<script lang="ts">
import { ActionTypes } from "@/store/actions";
import { Options, Vue } from "vue-class-component";

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
