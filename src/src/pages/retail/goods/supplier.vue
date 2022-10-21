<template>
  <div>
    <el-container style="border: 1px solid #eee;padding:10px;">
      <el-main>
          <list
            ref="list"
            list-type="list"
            :storage-type="storageType"
            :default-condition="listCondition"
            :service="service_name"
            :selectMode="selectMode"
            @grid-data-changed="$emit('grid-data-changed', $event)"
          >
            <template #gridHeader v-if="!selectMode">
              <el-button size="small" type="primary" @click="toAdd"
                >+新增供应商</el-button
              >
              <!-- <el-button size="small" type="primary" @click="showBatchUpdate"
                >批量修改</el-button
              > -->
            </template>
          </list>
      </el-main>
    </el-container>

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
        :service="getAddService"
      >
      </simple-add>
    </el-dialog>
    <el-dialog
      title="编辑"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'update'"
      @close="activeForm = 'xx'"
    >
      <bx-update :service="updateService" :pk="id"></bx-update>
    </el-dialog>
    <el-dialog
      title="复制"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'duplicate'"
      @close="activeForm = 'xx'"
    >
      <simple-add
        name="list-duplicate"
        ref="duplicate-form"
        v-if="activeForm == 'duplicate'"
        :service="getAddService"
        :default-conditions="getDefaultCondition4Duplicate"
        :submit2-db="storageType == 'db'"
      >
      </simple-add>
    </el-dialog>

    <el-dialog
      center
      title="批量修改"
      width="600px"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="activeForm == 'batchUpdate'"
      @close="activeForm = 'xx'"
    >
      <batch-update
        :multipleSelection="multipleSelection"
        service="srvretail_supplier_info_update"
        @cancel="activeForm = 'x'"
        @success="batchUpdateSuccess"
        v-if="activeForm == 'batchUpdate'"
      ></batch-update>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 供应商信息
 */
import ChildList from "@/components/common/child-list";
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";

import List from "./components/list";
import detail from "./components/detail.vue";
import BatchUpdate from "./components/batch-update.vue";
import BxUpdate from "./components/update.vue";

export default {
  name: "goodsList",
  components: {
    List,
    ChildList,
    SimpleAdd,
    SimpleUpdate,
    simpleFilter,
    detail,
    BatchUpdate,
    BxUpdate,
  },
  computed: {
    service_name() {
      return this.service || this.$route.query.service_name||'srvretail_supplier_info_select';
    },
    addButton() {
      return this.rowButton.find((item) => item.button_type === "addchild");
    },
  },
  data() {
    return {
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
      rowButton: [],
      gridButton: [],
      mainType: "list",
      detailshow: true,
      defaultProps: {
        children: "children",
        label: "",
      },
      id: "",
      updateService: "",
      addService: "",
    };
  },
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],
  props: {
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
    batchUpdateSuccess() {
      this.activeForm = "x";
      this.refreshTable();
    },
    // 批量编辑弹框
    showBatchUpdate() {
      let selectRows = this.getListSelection();
      if (Array.isArray(selectRows) && selectRows.length > 0) {
        this.multipleSelection = selectRows;
        this.activeForm = "batchUpdate";
      } else {
        this.$message({ message: "请先勾选要编辑的行", showClose: true });
      }
    },
    // 跳转到新增页面
    toAdd() {
      this.$router.push(`/goods-add?service=srvretail_supplier_info_add&title=新增供应商`);
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

    rowButtonClick(item, row) {
      if (item.button_type == "addchild") {
        this.activeForm = "add-child";
      } else if (item.button_type == "delete") {
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        })
          .then(() => {
            var deleteRequests = [];
            var request = {};
            request["serviceName"] = item.service_name;
            var cMap = { colName: "id", ruleType: "in" };
            var cVule = [];

            cVule.push(row.id);

            cMap["value"] = cVule.toString();
            request["condition"] = [cMap];
            deleteRequests.push(request);

            this.operate(deleteRequests).then((response) => {
              var state = response.body.state;

              if ("SUCCESS" == state) {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
                this.showTreeDetail = "";

                this.loadTableData();
              } else {
                this.$message({
                  type: "error",
                  message: response.body.resultMessage,
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      } else if (item.button_type == "duplicate") {
        this.onDuplicateClicked(row);
      } else if (item.button_type === "edit") {
        this.id = row.id;
        this.updateService = item.service_name;
        this.activeForm = "update";
      } else {
        this.activeForm = "add-child";
      }

      //this.onAddChildClicked(row);
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
    // this.loadTableData();
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
