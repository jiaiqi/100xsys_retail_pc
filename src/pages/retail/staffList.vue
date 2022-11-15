<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="tab.label"
      :name="'tab' + index"
      v-for="(tab, index) in tabs"
      :key="index"
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
        grid-button-justify="end"
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
      <bx-update
        :service="tab.service"
        :pk="tab.pk"
        :pkCol="tab.pkCol"
        :navAfterSubmit="tab.navAfterSubmit"
        :nav2LocationStr="tab.navRouterName"
        v-else-if="tab.type === 'update'"
      >
      </bx-update>
      <bx-detail
        :service="tab.service"
        :pkid="tab.pk"
        :pkCol="tab.pkCol"
        v-else-if="tab.type === 'detail'"
      ></bx-detail>
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
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";
import BxUpdate from "@/components/common/update.vue";
import bxDetail from "@/components/common/detail";

export default {
  // 员工管理
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],

  components: {
    List,
    Add,
    Treegrid,
    SimpleAdd,
    SimpleUpdate,
    simpleFilter,
    BxUpdate,
    bxDetail,
  },
  data() {
    return {
      activeName: "tab0",
      tabs: [
        {
          label: "员工信息",
          service: "srvretail_store_staff_select",
          condition: [],
        },
        {
          label: "角色权限管理",
          service: "srvsys_app_role_select",
          condition: [],
        },
        {
          label: "交接班历史",
          service: "srvretail_staff_handover_select",
          condition: [],
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
