import _ from "lodash"

export default {
  // The install method will be called with the Vue constructor as
  // the first argument, along with possible options
  install(Vue, options) {
    Vue.mixin({
      props: {
        $srvApp: {
          type: String
        },
      },

      computed: {



      },

      methods: {}
    })
  }
}