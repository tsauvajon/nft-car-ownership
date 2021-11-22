import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import Toast, { PluginOptions, POSITION } from "vue-toastification";

import "vue-toastification/dist/index.css";

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT,
};

createApp(App).use(store).use(Toast, options).mount("#app");
