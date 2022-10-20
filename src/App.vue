<template>
  <div id="app">
    <router-view v-if="ready"></router-view>
  </div>
</template>

<script>
import momentLib from "moment";
import extjs from "./components/test/extjs.js";
import dummy from "./components/test/spa_mock.js";

export default {
  name: "App",

  data() {
    return {
      ready: false
    };
  },

  methods: {
    getExtjsCondition() {
      let path = this.$route.path;
      let tokens = path.split("/").filter(i => !!i);
      let pageType = tokens[0];
      let pageParam = tokens[1];
      if (path.startsWith("/procdetail") || path.startsWith("/startproc")) {
        pageType = "proc";
      }

      let pageTypes = ["list", "add", "detail", "update", "proc", "listproc"];
      if (pageTypes.includes(pageType)) {
        return [
          {
            colName: "page_type",
            ruleType: "eq",
            value: pageType
          },
          {
            colName: "page_param",
            ruleType: "eq",
            value: pageParam
          }
        ];
      }

      return null;
    },

    loadExtJs() {
      this.ready = true;

      // let condition = this.getExtjsCondition();
      // if (!condition) {

      //   this.ready = true;
      // } else {
      //   this.select("srvsys_page_extjs_select", condition).then((resp) => {
      //     try {
      //       if (resp.data && resp.data.data && resp.data.data.length > 0) {
      //         let moment = momentLib;
      //         eval(resp.data.data[0].extjs)
      //       }
      //     } finally {
      //       // note: always last statement

      //       this.ready = true;
      //     }
      //   })
      // }
    },

    // 开发调试extjs
    testExtJs() {
      // !!! mock test code !!!!
      new Promise(resolve => setTimeout(resolve, 200)).then(() => {
        extjs.bind(this)();

        // note: always last statement

        this.ready = true;
      });
    }
  },

  beforeMount: function() {
    dummy();
    window.debugExtjs ? this.testExtJs() : this.loadExtJs();
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.el-input.is-disabled .el-input__inner {
  color: #303133 !important;
}
.el-textarea.is-disabled .el-textarea__inner {
  color: #303133 !important;
}
</style>
