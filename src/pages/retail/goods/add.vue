<template>
  <div v-if="service" class="add-goods">
    <nav-bar>新增商品</nav-bar>
    <add
      name="list-add"
      ref="add-form"
      :service="service"
      @on-custom-button="onCustomButton"
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
        :submit2-db="!isMem()"
        :service="addService"
        @form-loaded="onAddChildFormLoaded()"
        @action-complete="onAddChildFormActionComplete($event)"
        @executor-complete="onAddExecutorComplete($event)"
        @submitted2mem="onAdd2MemSubmitted"
      >
      </simple-add>
    </el-dialog>
  </div>
</template>

<script>
import add from "@/components/common/add.vue";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";
import SimpleAdd from "@/components/common/simple-add";
import NavBar from './components/nav-bar.vue'
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
