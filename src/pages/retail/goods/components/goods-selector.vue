<template>
  <div>
    <el-button type="primary" size="small" @click="activeForm = 'selector'"
      >选择商品</el-button
    >
    <el-dialog
      title="请选择"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'selector'"
      @close="activeForm = 'xx'"
      append-to-body
    >
      <el-container
        style="border: 1px solid #eee;padding:10px;"
        v-if="activeForm == 'selector'"
      >
        <el-aside style="width:auto">
          <div style="min-width:250px" class="flex flex-column h-full">
            <div class="tree-container flex-1">
              <div
                class="text-blue text-700 text-center p-10 cursor-pointer"
                @click="clearCondition"
              >
                全部商品
              </div>
              <el-tree
                class="filter-tree"
                :data="treeData"
                :props="defaultProps"
                default-expand-all
                :filter-node-method="filterNode"
                :expand-on-click-node="1 == 2"
                highlight-current
                node-key="id"
                @node-click="handleNodeClick"
                ref="tree"
              >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <span>{{ node.label }}</span>
                </span>
              </el-tree>
            </div>
          </div>
        </el-aside>
        <el-main>
          <el-input
            placeholder="请扫码或是输入商品名称/商品条码/助记码"
            v-model="inputVal"
            class="input-with-select"
            @change="toSearch"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
          <list
            ref="list"
            list-type="list"
            :storage-type="storageType"
            :default-condition="listCondition"
            :relationCondition="listRelationCondition"
            :service="right_service"
            :selectMode="true"
            @grid-data-changed="$emit('grid-data-changed', $event)"
          >
          </list>
          <el-row type="flex" justify="end"
            ><el-button size="small" @click="activeForm = 'x'">取消</el-button>
            <el-button size="small" type="primary" @click="confirm"
              >确定</el-button
            ></el-row
          >
        </el-main>
      </el-container>
    </el-dialog>
  </div>
</template>

<script>
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";

import List from "./list";
import ChildList from "./child-list";

export default {
  name: "goodsList",
  components: {
    List,
    ChildList,
  },
  computed: {
    service_name() {
      return this.service || "srvretail_goods_classify_select";
    },
    right_service() {
      return this.rightService || "srvretail_goods_info_select";
    },
  },
  data() {
    return {
      activeForm: "",
      inputVal: "",
      listType: "treelist",
      multipleSelection: [],
      treeData: [],
      showTreeDetail: "",
      currentData: {},
      filterText: "",
      foreign_key: {},
      maintable: "",
      condition: [],
      listCondition: [],
      listRelationCondition: {},
      rowButton: [],
      gridButton: [],
      mainType: "list",
      detailshow: true,
      defaultProps: {
        children: "children",
        label: "",
      },
    };
  },
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],
  props: {
    field: {
      type: Object,
    },
    selectMode: {
      type: Boolean,
      default: false,
    },
    service: {
      type: String,
    },
    rightService: {
      type: String,
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    toSearch() {
      let value = this.inputVal;
      this.listRelationCondition = {
        relation: "OR",
        data: [
          {
            colName: "goods_name",
            ruleType: "like",
            value,
          },
          {
            colName: "goods_barcode",
            ruleType: "like",
            value,
          },
          {
            colName: "mnemonic_code",
            ruleType: "like",
            value,
          },
        ],
      };
      this.refreshTable();
    },
    confirm() {
      const selection = this.getListSelection();
      this.$emit('confirm',selection)
    },
    getListSelection() {
      if (this.$refs.list && this.$refs.list.multipleSelection) {
        return this.$refs.list.multipleSelection;
      }
    },
    refreshTable() {
      if (this.$refs.list && this.$refs.list.loadTableData) {
        this.$nextTick(() => {
          this.$refs.list.loadTableData();
        });
      }
    },
    clearCondition() {
      this.listCondition = [];
      this.refreshTable();
    },
    buildListCondition() {
      let res = [];
      console.log(this.currentData);
      if (this.currentData && this.currentData.no) {
        res.push({
          colName: "classify_path",
          ruleType: "like]",
          value: this.currentData["path"],
        });
      }
      return res;
    },
    getService: function() {
      return this.service || this.$route.params.service_name;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.defaultProps.label].indexOf(value) !== -1;
    },
    getCurrentCondition() {
      return this.currentData.id + "";
    },
    getDefaultCond() {
      return [
        {
          colName: "dept_no",
          value: this.currentData.dept_no,
          ruleType: "eq",
        },
      ];
    },
    handleNodeClick(data) {
      if (this.currentData != data) {
        this.currentData = data;
        if (this.mainType === "list") {
          this.listCondition = this.buildListCondition();
          this.refreshTable();
        } else {
          if (this.showTreeDetail == "1") {
            this.showTreeDetail = "2";
          } else {
            this.showTreeDetail = "1";
          }
        }
      }
    },
    async loadTableData() {
      var me = this;
      //srvcols cfg data
      await this.loadColsV2(this.service_name, this.listType).then(
        (response) => {
          this.gridButton = response.body.data["gridButton"];

          this.rowButton = [];
          for (var item of response.body.data["rowButton"]) {
            if (item.permission) {
              if (item.button_type == "addchild") {
                item.button_name = "添加";
                item.icon = "el-icon-document-add";
                this.rowButton.push(item);
              } else if (item.button_type == "duplicate") {
                item.icon = "el-icon-copy-document";
                this.rowButton.push(item);
              } else if (item.button_type == "delete") {
                item.icon = "el-icon-delete";
                this.rowButton.push(item);
              } else if (item.button_type == "edit") {
                item.icon = "el-icon-edit";
                this.rowButton.push(item);
              }
            }
          }

          var data = response.body.data;
          this.defaultProps.label = data["key_disp_col"];

          let foreignkeys = data["foreignkeys"];
          for (var item of foreignkeys) {
            let table_name = item.table_name;
            if (me.maintable == table_name) {
              me.foreign_key = item;
              break;
            }
          }
        }
      );

      //加载树结构数据
      this.treeSelect(this.service_name, this.condition).then((response) => {
        this.treeData = response.body.data;
        if (this.treeData.length > 0) {
          // this.currentData = this.treeData[0];
          this.showTreeDetail = "1";
        }
      });
    },
  },

  created: function() {
    var detailshowvalue = this.getVueUrlParams("detailshow");
    if (detailshowvalue) {
      if ("0" == detailshowvalue) {
        this.detailshow = false;
      } else {
        this.detailshow = true;
      }
    }
    this.loadTableData();
  },
};
</script>

<style scoped lang="scss">
@import "@/pages/retail/styles/public.scss";
.el-main {
  padding: 0px;
}
.el-aside {
  padding: 0px;
}
.tree-aside {
  width: auto;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.button-box {
  height: 44px;
  align-items: center;
  margin-right: 10px;
}
.tree-container {
  border: 1px solid #eee;
  margin-right: 10px;
}
@media only screen and (min-width: 1200px) {
  ::v-deep .el-col-lg-12 {
    width: 100% !important;
  }
}
::v-deep .el-col {
  width: 100% !important;
}
::v-deep .field-editor-container {
  display: flex;
  flex-wrap: wrap;
  .input-container {
    flex: 1;
    max-width: 800px !important;

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
</style>
