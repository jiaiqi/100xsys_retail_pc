<template>
  <div>
    <nav-bar>商品详情</nav-bar>
    <bx-detail :service="service" :id="id"></bx-detail>
  </div>
</template>

<script>
import bxDetail from "@/components/common/detail";
import NavBar from "./components/nav-bar.vue";

export default {
  components: {
    bxDetail,
    NavBar,
  },
  data() {
    return {
      id: "",
      service: "",
    };
  },
  created() {
    this.id = this.$route.query.id;
    this.service = this.$route.query.service;
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-col {
  width: 100% !important;
  .input-container {
    flex: 1;
    max-width: 800px !important;

    // align-items: center;
    .el-input {
      flex: 1;
      // margin-right: 10px;
    }
  }
}
</style>
