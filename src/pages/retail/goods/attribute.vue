<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="tab.label"
      :name="'tab' + index"
      v-for="(tab, index) in tabs"
      :key="tab.service"
    >
      <treegrid
        grid-button-justify="start"
        v-if="tab.type === 'treelist'"
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
import List from "./components/list";
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
          label: "商品分类",
          service: "srvretail_goods_classify_select",
          condition: [],
          type: "treelist",
        },
        {
          label: "商品单位",
          service: "srvretail_store_unit_select",
          condition: [],
        },
        {
          label: "商品品牌",
          service: "srvretail_goods_brand_select",
          condition: [],
        },
        {
          label: "商品标签",
          service: "srvretail_goods_lable_select",
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
      }
    }
  },
};
</script>
