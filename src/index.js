/**
 * index.js as entry for build component library
 */

import List from './components/common/list.vue'
import SimpleAdd from './components/common/simple-add.vue'
import SimpleUpdate from './components/common/simple-update.vue'
import SimpleDetail from './components/common/simple-detail.vue'
import ProcDetail from './components/common/procdetail.vue'
import PopupMemList from "./components/common/popup-mem-list.vue";
import VueUtil from './components/common/vue_util'
import bxPlugin from './plugin/bx-plugin.js'



export default {
  install(Vue, options) {
    VueUtil();
    Vue.use(bxPlugin)

    Vue.component("PopupMemList", PopupMemList);
    Vue.component("list", List);
    Vue.component("simple-add", SimpleAdd);
    Vue.component("simple-update", SimpleUpdate);
    Vue.component("simple-detail", SimpleDetail);
    Vue.component("proc-detail", ProcDetail);
  }
};
