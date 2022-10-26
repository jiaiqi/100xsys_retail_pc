<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="tab.label || tab.name"
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
      <bx-update
        :key="tab.service"
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
import ChildList from "@/components/common/child-list";
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";
import BxUpdate from "@/components/common/update.vue";
import bxDetail from "@/components/common/detail";

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
  },
  data() {
    return {
      activeName: "tab0",
      tabs: [],
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  created() {
    if (this.$route.query.tenant_no) {
      let tenant_no = this.$route.query.tenant_no;
      this.tabs = [
        {
          name: "会员等级设置",
          type: "update",
          service: "srvretail_member_setup_level_update",
          pk: tenant_no,
          pkCol: "store_no",
        },
        {
          name: "会员打折优惠设置",
          type: "update",
          service: "srvretail_member_setup_discount_update",
          pk: tenant_no,
          pkCol: "store_no",
        },
        {
          name: "会员充值设置",
          type: "update",
          service: "srvretail_member_setup_recharge_update",
          pk: tenant_no,
          pkCol: "store_no",
        },
        {
          name: "会员积分设置",
          type: "update",
          service: "srvretail_member_setup_integral_update",
          pk: tenant_no,
          pkCol: "store_no",
        },
      ];
    }
    // if (this.$route.query.operator_params) {
    //   let operator_params = JSON.parse(this.$route.query.operator_params);
    //   if (
    //     operator_params &&
    //     operator_params.tabs &&
    //     Array.isArray(operator_params.tabs)
    //   ) {
    //     this.tabs = operator_params.tabs;
    //   } else {
    //     if (this.$route.name === "tabs") {
    //       this.tabs = [];
    //       return;
    //     }
    //   }
    // }
  },
};
</script>
