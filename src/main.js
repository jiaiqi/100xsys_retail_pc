// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 自定义theme.css
import '../theme/less/common-theme.less'
import VueResource from 'vue-resource';
import VueInit from '@/components/common/vue_init'
import VueUtil from '@/components/common/vue_util'
import store from './store'
import bxPlugin from './plugin/bx-plugin.js'

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

Vue.config.productionTip = false
Vue.use(Viewer);
Viewer.setDefaults({
  Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
});

VueInit();
VueUtil();
Vue.use(bxPlugin)
Vue.use(ElementUI);
Vue.use(VueResource);

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
});
window.app = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
