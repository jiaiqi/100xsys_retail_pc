<template>
  <div v-if="service" class="add-goods">
    <!-- <nav-bar>{{title||'新增'}}</nav-bar> -->
    <add
      name="list-add"
      ref="add-form"
      :service="service"
      @on-custom-button="onCustomButton"
      nav2LocationStr="goodsList"
      @action-complete="onAddFormActionComplete($event)"
    >
    </add>

    <el-dialog
      title="添加"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'add-child'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <simple-add
        name="list-add-child"
        ref="add-child-form"
        v-if="activeForm == 'add-child'"
        :submit2-db="true"
        :service="addService"
      >
      </simple-add>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 商品新增
 */
// import add from "./components/add.vue";
// import SimpleAdd from "./components/simple-add.vue";
import add from "@/components/common/add.vue";
import SimpleAdd from "@/components/common/simple-add.vue";

import NavBar from './components/nav-bar.vue'


import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";

export default {
  name: "goodsAdd",
  components: {
    add,
    SimpleAdd,
    NavBar
  },
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],
  mounted() {
    this.service = this.$route.query.service;
    this.title = this.$route.query.title;
  },
  methods: {
    onCustomButton(btn) {
      if (btn) {
        if (btn.type == "add" && btn.service) {
          this.addService = btn.service;
          this.activeForm = "add-child";
        }
        if (btn.type == "function" && btn.function) {
          const fun = eval(btn.function);
          const value = fun();
        }
      }
    },
  },
  data() {
    return {
      title:"",
      service: "",
      activeForm: "",
      addService: "",
    };
  },
};
</script>

<style lang="scss" scoped>

::v-deep .field-editor-container {
  display: flex;
  flex-wrap: wrap;
  .input-container {
    flex: 1;
    max-width: 600px !important;

    // align-items: center;
    .el-input {
      flex: 1;
      // margin-right: 10px;
    }
  }
  .el-button.custom-button {
    margin-left: 10px;
    padding-left: 20px;
    padding-right: 20px;
    min-width: 110px;
  }
  .el-date-editor {
    width: 100%;
  }
}
::v-deep .el-col {
  .el-form-item {
    .el-col {
      display: flex;
      div {
        flex: 1;
      }
      .raw_field_editor {
        flex: 1;
      }
    }
  }
}
</style>
