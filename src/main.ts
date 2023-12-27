import { createApp } from "vue";
import App from "./App.vue";
import { VueFire } from "vuefire";
import "./registerServiceWorker";
import router from "./router";
import { firebaseApp } from "./firebase_declare";

createApp(App)
  .use(router)
  .use(VueFire, {
    firebaseApp,
    modules: [],
  })
  .mount("#app");
