<template>

  <div>

    <el-container style="border: 1px solid #eee;">

      <el-aside style="width:auto">

        <div style="min-width:250px">
          <el-input style="width:230px" placeholder="输入关键字进行过滤" v-model="filterText">
          </el-input>

           <template v-for="(item, index) in rowButton">
            
                <i  :key="index" v-if="item.button_type=='addchild'" @click="rowButtonClick('','')" class="el-icon-document-add"></i>
           </template>

          <el-tree class="filter-tree" :data="treeData" :props="defaultProps" default-expand-all :filter-node-method="filterNode" :expand-on-click-node='1==2' highlight-current node-key="id" @node-click="handleNodeClick" ref="tree">

            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>

                <el-dropdown>
                  <span class="el-dropdown-link">
                    <i class="el-icon-s-tools"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <template v-for="(item, index) in rowButton">

                      <el-dropdown-item :key="index">
                        <i @click="rowButtonClick(item,data)" v-bind:class="item.icon">{{item.button_name}}</i>
                      </el-dropdown-item>
                    </template>

                  </el-dropdown-menu>
                </el-dropdown>

              </span>
            </span>
          </el-tree>

        </div>
      </el-aside>
      <el-main>

        <div v-if="mainType=='detail'">

          <div>
            <detail :detailshow="detailshow" v-if="showTreeDetail=='1'" form-type="detail" name="tree-node-detail" ref="tree-node-detail" :service="service_name" :pkid="getCurrentCondition()"></detail>

          </div>

          <div>

            <detail :detailshow="detailshow" v-if="showTreeDetail=='2'" form-type="detail" name="tree-node-detail" ref="tree-node-detail" :service="service_name" :pkid="getCurrentCondition()"></detail>
          </div>

        </div>

      </el-main>

    </el-container>

    <el-dialog title="添加" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'add-child'" @close="activeForm = 'xx'" append-to-body>
      <simple-add name="list-add-child" ref="add-child-form" v-if="activeForm == 'add-child'" :submit2-db="!isMem()" :service="getAddService" @form-loaded="onAddChildFormLoaded()" @action-complete="onAddChildFormActionComplete($event)" @executor-complete="onAddExecutorComplete($event)" @submitted2mem="onAdd2MemSubmitted">
      </simple-add>
    </el-dialog>

    <el-dialog title="复制" width="90%" :close-on-click-modal="1==2" append-to-body :visible="activeForm == 'duplicate'" @close="activeForm = 'xx'">
      <simple-add name="list-duplicate" ref="duplicate-form" v-if="activeForm == 'duplicate'" :service="getAddService" :default-conditions="getDefaultCondition4Duplicate" :submit2-db="storageType == 'db'" @action-complete="onAddFormActionComplete($event)" @form-loaded="onDuplicateFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </simple-add>
    </el-dialog>

  </div>

</template>



<style scoped>
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
</style>


<script>
import { GridInfo } from "../model/GridInfo";
import List from "./list";
import detail from "./detail.vue";
import ChildList from "./child-list";
import SimpleAdd from "./simple-add";
import simpleFilter from "./simple-filter";
import SimpleUpdate from "./simple-update";
import ListPopupMixin from "../mixin/list-popup-mixin";
import CustButtonMinx from "../mixin/cust-button-minx";
import MemListMixin from "../mixin/mem-list-mixin";

export default {
  components: {
    List,
    ChildList,
    SimpleAdd,
    SimpleUpdate,
    simpleFilter,
    detail
  },

  data() {
    return {
      service_name: this.service || this.$route.params.service_name,
      listType: "treelist",
      treeData: [],
      showTreeDetail: "",
      currentData: {},
      filterText: "",
      mainservice: "",
      foreign_key: {},
      maintable: "",
      condition: [],
      rowButton: [],
      gridButton: [],
      mainType: "detail",
      detailshow:true,
      defaultProps: {
        children: "children",
        label: ""
      }
    };
  },
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],
  props: {
    service: {
      type: String
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
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
          ruleType: "eq"
        }
      ];
    },
    handleNodeClick(data) {
      if (this.currentData != data) {
        this.currentData = data;
        //var xxx= this.$refs["tree-node-detail"];
        if (this.showTreeDetail == "1") {
          this.showTreeDetail = "2";
        } else {
          this.showTreeDetail = "1";
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
          type: "info"
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

            this.operate(deleteRequests).then(response => {
              var state = response.body.state;

              if ("SUCCESS" == state) {
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
                this.showTreeDetail = "";

                this.loadTableData();
              } else {
                this.$message({
                  type: "error",
                  message: response.body.resultMessage
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      } else if (item.button_type == "duplicate") {
        this.onDuplicateClicked(row);
      } else {
        this.activeForm = "add-child";
      }

      //this.onAddChildClicked(row);
    },
    async loadTableData() {
      var me = this;
      //srvcols cfg data
      await this.loadColsV2(this.service_name, this.listType).then(response => {
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
      });

      //加载树结构数据
      this.treeSelect(this.service_name, this.condition).then(response => {
        this.treeData = response.body.data;
        if (this.treeData.length > 0) {
          this.currentData = this.treeData[0];
          this.showTreeDetail = "1";
        }
      });
    }
  },

  created: function() {

    var detailshowvalue=this.getVueUrlParams("detailshow");
    if(detailshowvalue){
      if("0"==detailshowvalue){
           this.detailshow=false;
      }else{
          this.detailshow=true;
      }
    }
    this.loadTableData();
  }
};
</script>