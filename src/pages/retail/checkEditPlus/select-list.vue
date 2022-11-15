<template>
  <div>
      <el-row style="padding:30px">
         <el-col :span="24">
       <el-input
    placeholder="请扫码或输入商品名/助记码"
    suffix-icon="el-icon-full-screen"
    @keyup.enter.native="onEnter"
    v-model="searchStr">
  </el-input></el-col>

      </el-row>
      <el-row>
        
  <el-col :span="6"  v-show="type == 'LAR'">
     <div class="tree-container flex-1"> 
            <div
              class="text-blue text-700 text-center p-10 cursor-pointer"
              @click="clearCondition"
            >
              全部分类
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
              style="overflow-y: scroll;height:330px"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <!-- <span>
                  <el-dropdown>
                    <span class="el-dropdown-link">
                      <i class="el-icon-s-tools"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <template v-for="(item, index) in rowButton">
                        <el-dropdown-item :key="index">
                          <i
                            @click="rowButtonClick(item, data)"
                            v-bind:class="item.icon"
                            >{{ item.button_name }}</i
                          >
                        </el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </el-dropdown>
                </span> -->
              </span>
            </el-tree>
          </div>
  </el-col>
  <el-col :span="type == 'LAR'?18:24">
    <checkList
            ref="list"
            list-type="selectlist"
            :readOnly="true"
            :storage-type="storageType"
            :default-condition="listCondition"
            :relationCondition="relationCondition"
            :service="mainservice"
            @grid-data-changed="$emit('grid-data-changed', $event)"
          >
          </checkList>
          </el-col>
     
      

      </el-row>

    
    <el-row type="flex" class="row-bg" justify="center">
           <el-button  type="primary" size="small"   @click="onSaveCheck()">确认</el-button>
            <el-button   type="info" size="small"  @click="onCancelCheck()">取消</el-button>
      </el-row>
  </div>
</template>



<script>
import checkList from "@/components/common/list";
import detail from "@/components/common/detail.vue";
import ChildList from "@/components/common/child-list";
import SimpleAdd from "@/components/common/simple-add";
import simpleFilter from "@/components/common/simple-filter";
import SimpleUpdate from "@/components/common/simple-update";
import ListPopupMixin from "@/components/mixin/list-popup-mixin";
import CustButtonMinx from "@/components/mixin/cust-button-minx";
import MemListMixin from "@/components/mixin/mem-list-mixin";

export default {
  name:"selectlist",
  components: {
    checkList: () => import("@/components/common/list.vue"),
    ChildList,
    SimpleAdd,
    SimpleUpdate,
    simpleFilter,
    detail,
  },
  computed: {
    service_name() {
      return this.service || this.$route.query.service_name;
    },
    mainservice() {
      return this.childservice || this.$route.query.mainservice;
    },
    addButton(){
      return this.rowButton.find(item=>item.button_type==='addchild')
    },
  },
  data() {
    return {
      listType: "treelist",
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
      detailshow: true,
      defaultProps: {
        children: "children",
        label: "",
      },
      searchStr:"",
      relationCondition:{}
    };
  },
  mixins: [ListPopupMixin, CustButtonMinx, MemListMixin],
  props: {
    service: {
      type: String,
    },
    childservice: {
      type: String,
    },
    type:{
       type: String,
    },
    searchColumn:{
       type: [Array,String],
       default:function(){
        return "goods_barcode,goods_name,mnemonic_code"
       }
    },
    mainType:{
      type: String,
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    onEnter(){
      console.log('回车')
      let defaultCond = []
      let cond = {
        colName:this.searchColumn,
        ruleType:"in",
        value:this.searchStr
      }
      

      this.currentData = {}
      

      let relation_Conditions={
              "relation": "OR",
              "data": []
          }
      let  colData = {
              "colName":"",
              "ruleType":"",
              "value":""
          }
      let cols = []
      if(this.searchStr){
        if(this.searchColumn.indexOf(',') == -1){
          let cond = {
            colName:this.searchColumn,
            ruleType:"in",
            value:this.searchStr
          }
          
          this.listCondition.push(cond)
        }else if(this.searchStr && this.searchColumn.indexOf(',') !== -1){
          cols = this.searchColumn.split(',')
          for(let col of cols){
              colData = {
                  "colName":col,
                  "ruleType":"[like]",
                  "value":this.searchStr
              }
              relation_Conditions.data.push(this.bxDeepClone(colData))
              // this.relationCondition = relation_Conditions
          }
          
              this.$set(this,'relationCondition',relation_Conditions)
        }
      }else{
        this.listCondition = []
        this.relationCondition = {}
      }
      
      this.$nextTick(()=>{
          this.$refs.list.loadTableData();
      })
      
      // this.searchColumn = []
      
    },
    onSaveCheck(){
      let self = this
      let val = this.$refs.list.getSelectedRows() //getSelectionRowData
      console.log('选择',val)
      this.$emit('on-save',val)
    },
    onCancelCheck(){
      let self = this
      let val = this.$refs.list.getSelectedRows()
      console.log('选择',val)
      this.$emit('on-clancel',val)
    },
    refreshTable() {
      if (this.$refs.list && this.$refs.list.loadTableData) {
        this.$nextTick(() => {
          this.$refs.list.loadTableData();
        });
      }
    },
    clearCondition() {
      this.currentData = {}
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
      console.log("handleNodeClick",data)
      if (this.currentData != data) {
        this.currentData = data;
        if (this.mainType === "add") {
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
</style>
