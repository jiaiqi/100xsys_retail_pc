<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="tab.label"
      :name="'tab' + index"
      v-for="(tab, index) in tabs"
      :key="tab.service"
    >
      <add
        name="detail-add"
        ref="add-form"
        v-if="tab.type == 'add'"
        :service="tab.service"
        :submit2-db="true"
        @action-complete="onAddFormActionComplete($event)"
      >
      </add>
      <treegrid
        grid-button-justify="start"
        v-else-if="tab.type === 'treelist'"
        ref="list"
        :name="'tab' + index"
        list-type="treelist"
        :service="tab.service"
        :default-condition="tab.condition"
        @add-form-loaded="onAddFormLoaded($event)"
        @update-form-loaded="onUpdateFormLoaded($event)"
      >
      </treegrid>
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
 * 商品调价页面
 */
// import List from "./components/list";
// import Add from "./components/add.vue";

import List from "@/components/common/list";
import Add from "@/components/common/add.vue";


import Treegrid from "@/components/common/treegrid.vue";
import detail from "@/components/common/detail.vue";
import ChildList from "@/components/common/child-list";
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";

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
    detail,
  },
  data() {
    return {
      activeName: "tab0",
      tabs: [
        {
          label: "新增调价",
          service: "srvretail_modify_price_record_add",
          type: "add",
        },
        {
          label: "调价历史",
          service: "srvretail_modify_price_record_select",
          type: "list",
        },
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
      }
    }
  },
};
</script>
