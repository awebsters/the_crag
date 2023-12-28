import { createApp } from "vue";
import App from "./App.vue";
import { VueFire } from "vuefire";
import "./registerServiceWorker";
import router from "./router";
import { firebaseApp } from "./firebase_declare";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";
/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
/* import specific icons */
import { faCompass } from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(faCompass);

createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(router)
  .use(VueFire, {
    firebaseApp,
    modules: [],
  })
  .mount("#app");
