<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="tab.label"
      :name="'tab' + index"
      v-for="(tab, index) in tabs"
      :key="tab.service"
    >
      <editGridPlus
        v-if="tab.type == 'editGridPlus'"
        :type="'update'"
        :service="'srvretail_stock_warning_select'"

      >
      </editGridPlus>
      <list
        v-else
        ref="list"
        list-type="list"
        :default-condition="tab.condition"
        :service="tab.service"
        @grid-data-changed="$emit('grid-data-changed', $event)"
      >
      </list>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
/**
 * 商品属性页面
 */
// import List from "./components/list";
// import Add from "./components/add.vue";

import List from "@/components/common/tab-list2";
import Add from "@/components/common/add.vue";

import Treegrid from "@/components/common/treegrid.vue";
import ChildList from "@/components/common/child-list";
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";
import BxUpdate from "@/components/common/update.vue";
import bxDetail from "@/components/common/detail";
import editGridPlus from "@/components/common/edit-grid-plus";

export default {
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],

  components: {
    List,
    Add,
    Treegrid,
    ChildList,
    SimpleAdd,
    SimpleUpdate,
    simpleFilter,
    BxUpdate,
    bxDetail,
    editGridPlus
  },
  data() {
    return {
      activeName: "tab0",
      tabs: [
        {
          label: "库存预警设置",
          service: "srvretail_goods_classify_select",
          condition: [],
          type: "editGridPlus",
        },
        {
          label: "库存预警商品",
          service: "srvretail_stock_early_warning_select",
          condition: [],
          type: "list"
        }
      ],
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  created() {
    if (this.$route.query.operator_params) {
      let operator_params = JSON.parse(this.$route.query.operator_params);
      if (
        operator_params &&
        operator_params.tabs &&
        Array.isArray(operator_params.tabs)
      ) {
        this.tabs = operator_params.tabs;
      } else {
        if (this.$route.name === "tabs") {
          this.tabs = [];
          return;
        }
      }
    }
  },
};
</script>
