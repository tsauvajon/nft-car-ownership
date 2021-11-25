import "vue-toastification/dist/index.css";
import Toast, { POSITION, PluginOptions } from "vue-toastification";
import App from "@/App.vue";
import { createApp } from "vue";
import store from "@/store";

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT,
};

createApp(App).use(store).use(Toast, options).mount("#app");
