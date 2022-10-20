<template>

  <div>
    <div v-show="selectFormShow" v-if="searchForm">
      <simple-filter v-if="srv_cols" :srv_cols="srv_cols"
                     v-on:search-clicked="query"></simple-filter>
    </div>

    <el-row type="flex" class="row-bg" justify="end">

      <div class="table-head-btns">
        <template v-for="(item, index) in gridButton">
          <el-button :type="!item.button_cls ? 'primary' : item.button_cls"
                     :key="index" v-if="item.permission"
                     @click="gridButtonClick(item)">
            {{item.button_name}}
          </el-button>
        </template>
      </div>

    </el-row>

    <el-table ref="treegrid" 
              :data="gridData" 
              stripe 
              border
              lazy
              :row-class-name="tableRowClassName"
              @filter-change="filterChange"
              @sort-change="handleSortChange">

      <el-table-column width="50">
        <template slot-scope="scope">
          <el-checkbox :indeterminate="scope.row._indeterminate"
                       v-model="scope.row._checked"
                       @change="handleSelectChange(scope.row)"></el-checkbox>

        </template>
      </el-table-column>

      <el-table-column width="300" v-for="(item, index) in gridHeader"
                       :key="index" v-if="item.column==firstColumn"
                       :label="item.label"
                       :min-width="item.list_min_width"
                       show-overflow-tooltip>

        <template slot-scope="scope">
          <span v-for="(space, levelIndex) in scope.row._level"
                :key="levelIndex" class="ms-tree-space">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

          <span class="button is-outlined is-primary is-small"
                v-if="toggleIconShow(scope.row)" @click="toggle(scope.row)">
            <i v-if="!scope.row._expanded" class="el-icon-plus"
               aria-hidden="true"></i>
            <i v-if="scope.row._expanded" class="el-icon-minus"
               aria-hidden="true"></i>
          </span>
          <span v-else class="ms-tree-space">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span :title="scope.row[firstColumn]">
            {{scope.row[firstColumn]}}
          </span>
        </template>

      </el-table-column>

      <el-table-column v-for="(item, index) in gridHeader" :key="index"
                       v-if="item.show&&item.column!=firstColumn"
                       :width="item.width" :prop="item.column"
                       :min-width="item.list_min_width"
                       :label="item.label" :filters="item.filters"
                       :column-key="item.column"
                       :sortable="item.sortable && !isMem() ? 'custom' : false">
        <template slot-scope="scope">
          <span>{{formatValue(scope.row, item)}}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="250">
        <template slot-scope="scope">

          <el-button v-for="(operate_item, operate_index) in rowButton"
                     :key="operate_index"
                     @click="rowButtonClick(operate_item,scope.row)" type="text"
                     size="small"
                     v-if="getDispExps(operate_item,scope.row)&&operate_item.permission">
            {{operate_item.button_name}}
          </el-button>
          <el-button v-if="isMem() && scope.row._dirtyFlags"
                     @click="onUndoSubmitted(scope.row)"
                     type="text" size="small">
            取消
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-row v-if="!isMem()" type="flex" class="row-bg" justify="center">
      <el-pagination @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"
                     :current-page="gridPage.currentPage"
                     :page-sizes="gridPage.pageSizes"
                     :page-size="gridPage.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="gridPage.total">
      </el-pagination>
    </el-row>

    <el-dialog title="添加" width="90%" :close-on-click-modal="1==2"
               :visible="activeForm == 'add'"
               @close="activeForm = 'xx'" append-to-body>
      <simple-add name="list-add" ref="add-form" v-if="activeForm == 'add'"
                  :service="getAddService"
                  :submit2-db="!isMem()"
                  @form-loaded="onAddFormLoaded($refs['add-form'])"
                  @action-complete="onAddFormActionComplete($event)"
                  @executor-complete="onAddExecutorComplete($event)"
                  @submitted2mem="onAdd2MemSubmitted"
      >

      </simple-add>
    </el-dialog>

    <el-dialog title="复制" width="90%" :close-on-click-modal="1==2"
               :visible="activeForm == 'duplicate' || activeForm == 'duplicatedeep' "
               @close="activeForm = 'xx'" append-to-body>
      <simple-add name="list-add" ref="duplicate-form"
                  v-if="activeForm == 'duplicate' || activeForm == 'duplicatedeep' "
                  :service="getAddService"
                  :submit2-db="!isMem()"
                  :default-conditions="getDefaultCondition4Duplicate"
                  @action-complete="onAddFormActionComplete($event)"
                  @form-loaded="onDuplicateFormLoaded($refs['duplicate-form'])"
                  @executor-complete="onAddExecutorComplete($event)"
                  @submitted2mem="onAdd2MemSubmitted"
      >

      </simple-add>
    </el-dialog>

    <el-dialog title="编辑" width="90%" :close-on-click-modal="1==2"
               :visible="activeForm == 'update'"
               @close="activeForm = 'xx'" append-to-body>
               
      <simple-update name="list-update" ref="update-form"
                     v-if="activeForm == 'update'"
                     :submit2-db="!isMem()"
                     :service="getUpdateService" :pk="getClickedRowPk('update')"
                     @form-loaded="onUpdateFormLoaded($refs['update-form'])"
                     @action-complete="onUpdateFormActionComplete($event)"
                     @executor-complete="onUpdateExecutorComplete($event)"
                     @submitted2mem="onUpdate2MemSubmitted"
      >

      </simple-update>
    </el-dialog>

    <el-dialog title="添加下级节点" width="90%" :close-on-click-modal="1==2"
               :visible="activeForm == 'add-child'"
               @close="activeForm = 'xx'" append-to-body>
      <simple-add name="list-add-child" ref="add-child-form"
                  v-if="activeForm == 'add-child'"
                  :submit2-db="!isMem()"
                  :service="getAddService"
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
  import {GridInfo} from "../model/GridInfo";
  import simpleFilter from "./simple-filter.vue";
  import SimpleAdd from "./simple-add.vue";
  import SimpleUpdate from "./simple-update.vue";
  import ListPopupMixin from "../mixin/list-popup-mixin";
  import CustButtonMinx from "../mixin/cust-button-minx";
  import MemListMixin from "../mixin/mem-list-mixin";
  import ListMixin from "../mixin/list-mixin"


  function deepClone(obj) {
    if (obj == null) return null;
    let newObj = obj instanceof Array ? [] : {};
    for (var i in obj) {
      newObj[i] = typeof obj[i] == "object" ? deepClone(obj[i]) : obj[i];
    }
    return newObj;
  }

  var removeByValue = function (sourceData, val) {
    //对数组原型添加删除指定项的方法
    for (var i = 0; i < sourceData.length; i++) {
      if (sourceData[i] == val) {
        sourceData.splice(i, 1);
        break;
      }
    }
  };


  export default {
    name: "treegrid",
    components: {
      simpleFilter,
      SimpleAdd,
      SimpleUpdate
    },
    mixins: [ListPopupMixin, CustButtonMinx, MemListMixin, ListMixin],

    props: {
      service: {
        type: String
      },
      searchForm: {
        type: Boolean,
        default: function () {
          return true;
        }
      },
      listType: {
        type: String,
        default: function () {
          return "treelist";
        }
      },
      pageSize: {
        type: Number
      },
      defaultCondition: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    data() {
      return {
        noCol: "",
        parentCol: "",
        firstColumn: null,
        selectFormShow: false,
        gridHeaderRender: false,
        multipleSelection: [],
        gridHeader: [],
        gridData: [],
        gridButton: [],
        rowButton: [],
        srv_cols: null,
        order: [],
        searchFormCondition: [],
        filterCondition: [],
        service_name: this.service || this.$route.params.service_name,
        gridPage: {
          pageSizes: [],
          pageSize: 10,
          currentPage: 1,
          total: 0
        }
      };
    },
    methods: {
      toggleIconShow(record) {
        if (record.is_leaf == "是") {
          return false;
        } else {
          return true;
        }
      },
      getDispExps(item, data) {
        var result = true;

        try {
          var disp_exps = item.disp_exps;
          if (disp_exps != undefined && disp_exps != "" && disp_exps != null) {
            result = eval(disp_exps);
          }
        } catch (e) {
           console.error(e)
        }

        return result;
      },
      removeChildVaule(rowData) {
        //递归删除自数据

        var me = this;
        let dataArr = [];
        let childLen = rowData._children.length;
        dataArr.push(rowData);
        let arr = me.getChildFlowId(dataArr, []);
        for (let i = 0; i < childLen; i++) {
          if (rowData._children[i]._children != undefined) {
            var _len = rowData._children[i]._children.length;
            if (_len > 0) {
              this.removeChildVaule(rowData._children[i]);
            }
          }

          me.gridData.map(value => {
            if (
              arr.indexOf(value[this.parentCol]) > -1 &&
              !value["_level_node"]
            ) {
              removeByValue(me.gridData, value);
            }
          });
        }
      },
      async toggle(rowData) {
        let me = this;
        //展开下级

        let childLen = !rowData._children ? 0 : rowData._children.length;
        //let childLen = 0;
        if (rowData._expanded) {
          this.removeChildVaule(rowData);

          /**
           let dataArr = [];
           dataArr.push(rowData);
           let arr = me.getChildFlowId(dataArr, []);
           for (let i = 0; i < childLen; i++) {
            me.gridData.map(value => {
              if (
                arr.indexOf(value[this.parentCol]) > -1 &&
                !value["_level_node"]
              ) {
                removeByValue(me.gridData, value);
              }
            });
          }*/
        } else {
          if (rowData._children && rowData._children.length > 0) {
            for (var item of rowData._children) {
              if (!rowData["_checked"]) {
                item["_checked"] = false;
                item["_indeterminate"] = false;

                if (item.is_leaf == "否") {
                  item._expanded = false;
                }
              }
              me.gridData.splice(me.gridData.indexOf(rowData) + 1, 0, item);
            }
          } else {
            var childData = [];
            var childCondition = [
              {
                colName: this.parentCol,
                value: rowData[this.noCol],
                ruleType: "eq"
              }
            ];

            //加载表格数据
            await this.select(
              this.service_name,
              childCondition,
              {
                pageNo: 1,  // 展开下级不参与分页，默认加载 300条数据。
                rownumber: 300
              },
              this.order
            ).then(response => {
              this.buildData(response.body.data, false);
              childData = response.body.data;
            });

            var data = me.setSpaceIcon(childData, rowData._level);

            rowData._children = deepClone(data);


            let i = 0;
            for (var item of rowData._children) {
              if (rowData["_checked"]) {
                item["_checked"] = true;
              }


              me.gridData.splice(me.gridData.indexOf(rowData) + i + 1, 0, item);
              i++;
            }
          }

          // let index = me.gridData.indexOf(rowData);
          // let pre = me.gridData.slice(0, index + 1);
          // let last = me.gridData.slice(index + 1);
          // let concatChildren = pre.concat(rowData._children);
          // me.gridData = concatChildren.concat(last);
        }
        rowData._expanded = !rowData._expanded;
      },
      getChildFlowId(data, emptyArr) {
        // 获取子级的flowId
        let me = this;
        Array.from(data).forEach(record => {
          emptyArr.push(record[this.noCol]);
          if (record._children && record._children.length > 0) {
            let childFlowIdArr = me.getChildFlowId(record._children, emptyArr);
            emptyArr.concat(childFlowIdArr);
          }
        });
        return emptyArr;
      },
      setSpaceIcon(data, level) {
        // 设置第一列的空格和方向按钮
        let me = this;
        let _level = 0;
        data.forEach(value => {
          value._expanded = false;
          if (level !== undefined && level !== null) {
            _level = level + 1;
          } else {
            _level = 1;
          }
          value._level = _level;
          if (value._children && value._children.length > 0) {
            me.setSpaceIcon(value._children, _level);
          }
        });
        return data;
      },
      filterChange(filters) {
        this.filterCondition = [];
        for (var key in filters) {
          var cMap = {};
          if (filters[key].length > 0) {
            cMap["colName"] = key;
            cMap["value"] = filters[key].toString();
            cMap["ruleType"] = "in";
            this.filterCondition.push(cMap);
          }
        }
        this.gridPage.currentPage = 1;

        this.loadTableData();
      },
      handleSortChange(column) {
        this.order = [];


        if (column["column"] != null) {
          if ("ascending" == column["order"]) {
            this.order.push({colName: column["prop"], orderType: "asc"});
          } else {
            this.order.push({colName: column["prop"], orderType: "desc"});
          }
        }
        // this.loadTableData();
      },
      gridButtonClick(item) {
        var type = item.button_type;
        var exeservice = item.service_name;
        var tab_title = item.service_view_name;

        if ("select" == type) {
          this.toggleFilters(item);
        } else if ("shrink" == type) {
          this.selectFormShow = false;
        } else if ("refresh" == type) {
          this.refresh();
        } else if ("batch_delete" == type) {
          this.batchDeleteData(exeservice);
        } else if ("add" == type) {
          this.onAddClicked();
        } else if ("customize" == type) {


          var operate_params_cfg = item.operate_params;
          if (item.select_data!='否'&&this.multipleSelection <= 0 && operate_params_cfg != undefined && operate_params_cfg != '' && operate_params_cfg != null) {
            this.$alert("请选择操作数据", "提示", {
              confirmButtonText: "确定"
            });
          } else {


            var me = this;

            if (item.operate_type == "修改") {
              this.customize_update(item, this.multipleSelection);
            } else if (item.operate_type == "删除") {
              this.customize_delete(item, this.multipleSelection);
            } else if (item.operate_type == "增加") {
              this.customize_add(item, this.multipleSelection);
            } else {
              this.customizeOperate(item, this.multipleSelection);
            }


          }


        }else if ("export" == type) {
          this.onExportClicked();
        }
      },
      batchDeleteData(exeservice) {
        this.multipleSelection = [];
        for (var item of this.gridData) {
          if (item["_checked"] && !item["_indeterminate"]) {
            this.multipleSelection.push({id: item["id"]});
          }
        }

        if (this.multipleSelection.length == 0) {
          this.$alert("请选择删除数据", "提示", {
            confirmButtonText: "确定"
          });
        } else {
          this.deleteData(this.multipleSelection, exeservice);
        }
      },
      rowButtonClick(operate_item, row) {
        

        var type = operate_item.button_type;
        var exeservice = operate_item.service_name;
        var tab_name = operate_item.service_view_name;

        if ("delete" == type) {
          this.deleteRowData(row, exeservice);
        } else if ("edit" == type) {



          if(operate_item.operate_service && Object.prototype.toString.call(operate_item.operate_service) !== "[object String]"){
          let srv = this.getButtonOptSrv(operate_item,row,"active")
          if(srv.length > 0){
            this.rowButtonActiveServiceName = srv[0].serviceName 
          }else{

          }
          
        }else{
          this.rowButtonActiveServiceName = operate_item.operate_service ||  operate_item.service_name
        }
       let actionConfig = this.getButtonOptSrv(operate_item,row,'active')
        //console.log('getButtonOptSrv',actionConfig)
          this.onUpdateClicked(row);
        } else if ("detail" == type) {
          var urlParams = "/" + exeservice + "/" + row.id + "?srvApp=" + this.resolveDefaultSrvApp();
          var disp_col = operate_item._disp_col;
          var disp_value = row[disp_col];

          var tab_title = tab_name.replace('查询', '');
          if (disp_value != null && disp_value != undefined && disp_value != '') {
            tab_title = disp_value + "(" + tab_title + "详情)";
          } else {
            tab_title = tab_title + "详情";
          }

          this.addTab("detail", urlParams, tab_title);
        } else if ("addchild" == type) {
          this.onAddChildClicked(row);
        } else if ("duplicate" == type || "duplicatedeep" == type) {
          this.onDuplicateClicked(row);
        } else if ("customize" == type) {
          var data = [row];
          if (operate_item.operate_type == "修改") {
            this.customize_update(operate_item, data);
          } else if (operate_item.operate_type == "删除") {
            this.customize_delete(operate_item, data);
          } else if (operate_item.operate_type == "增加") {
            this.customize_add(operate_item, data);
          } else {
            this.customizeOperate(operate_item, data);
          }
        }
      },

      deleteRowData(rowData, exeservice) {
        var dataArray = [rowData];
        this.deleteData(dataArray, exeservice)
          .then(() => {
            let parentKeyVal = rowData[this.parentCol];
            let keyVal = rowData[this.noCol];
            // this.mergeDelete(parentKeyVal, keyVal);   // 0109 树删除点击取消 romove 数据 
          })
      },

      deleteDataAndSave(deleteRowData, exeservice) {
        return this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {
            var deleteRequests = [];
            var request = {};
            request["serviceName"] = exeservice;

            var cMap = {colName: "id", ruleType: "in"};
            var cVule = [];
            for (var item of deleteRowData) {
              cVule.push(item.id);
            }
            cMap["value"] = cVule.toString();
            request["condition"] = [cMap];

            deleteRequests.push(request);

            return this.operate(deleteRequests).then(response => {
              var state = response.body.state;

              if ("SUCCESS" == state) {
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });

                if (this.gridData.length == cVule.length) {
                  if (this.gridPage.currentPage > 1) {
                    this.gridPage.currentPage = this.gridPage.currentPage - 1;
                  }
                }
                this.loadTableData()
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
      },
      async initGridData() {
        //加载serviceCols
        //加载serviceCols

        let gidInfo = new GridInfo();
        this.gridPage.pageSizes = gidInfo.pageSizes;


        await this.loadColsV2(this.service_name, this.listType)
          .then(response => {
            let listData = response.body.data["srv_cols"];
            this.gridButton = response.body.data["gridButton"];
            this.rowButton = response.body.data["rowButton"];

            this.srv_cols = listData;
            this.noCol = response.body.data["no_col"];
            this.parentCol = response.body.data["parent_no_col"];
            this.gridHeader = [];
            var column_index = 0;
            for (var serviceCol of listData) {
              if (serviceCol["columns"] == "id") {
                continue;
              }
              var header = {};

              header.srvcol = serviceCol;
              let colType = serviceCol["col_type"];
              header["column"] = serviceCol["columns"];
              header["label"] = serviceCol["label"];
              header["width"] = "";
              header["show"] = serviceCol["in_list"] == 1;
              header["sortable"] = true;
              header["list_min_width"] = serviceCol["list_min_width"];
              header["col_type"] = colType;

              if (header["sortable"] && column_index == 0) {
                this.firstColumn = serviceCol["columns"];
                column_index++;
              }
              if (serviceCol["col_type"] == "Enum" || serviceCol["col_type"] == "Dict") {
                let filters = [];
                // throw err, comment
                // for (var item of serviceCol["option_list_v2"]) {
                //   filters.push({text: item["label"], value: item["value"]});
                // }

                header["filters"] = filters;
              }

              this.gridHeader.push(header);
            }
          })
          .then(_ => {
            this.listLoaded = true
            this.$emit("list-loaded", this);
          });

        this.loadTableData(true);
      },

      loadTableData(isTop) {
        this.condition = [];
        var page = this.isMem() ? {
          pageNo: this.gridPage.currentPage,
          rownumber: 500
        } : {
          pageNo: this.gridPage.currentPage,
          rownumber: this.gridPage.pageSize
        };

        for (var cMap of this.filterCondition) {
          this.condition.push(cMap);
        }

        for (var cMap of this.searchFormCondition) {
          this.condition.push(cMap);
        }

        for (var cMap of this.defaultCondition) {
          this.condition.push(cMap);
        }

        this.condition.filter(item => item.dynamic === true).forEach(item => {
          let ctx = this
          item.value = eval(item.value);
        });


        let hasEmptyRequiredCondition = this.condition.filter(item => item.required === true && this.isEmptyCondition(item)).length > 0;
        if (hasEmptyRequiredCondition) {
          throw "hasEmptyRequiredCondition";
        }
        let cond = []
        if(this.custCondition.length > 0 && isTop){
          cond = [...this.custCondition]
        }else{
          cond = [...this.condition]
        }

        //树列表，没有搜索条件的时候，默认只查找父节点为空的数据
        if (this.searchFormCondition.length == 0) {
          if(!cond.find(item=>item.colName===this.parentCol)){
            var initCondition = {
              colName: this.parentCol,
              ruleType: "isnull"
            };
            cond.push(initCondition);
          }
        }

        //加载表格数据
        this.select(
          this.service_name,
          cond,
          page,
          this.order
        ).then(response => {
          // rename for element stupid bug of using children as bulitin
          response.body.data && response.body.data.forEach(item => {
            item._children = item.children
            delete item.children
          })

          this.buildData(response.body.data, true);
          this.gridData = response.body.data;
          if (response.body.page) {
            this.gridPage.currentPage = response.body["page"]["pageNo"];
            this.gridPage.total = response.body["page"]["total"];
          }
        });
      },

      query(condtion) {
        this.searchFormCondition = condtion;
        this.gridPage.currentPage = 1;
        this.condition = [];
        this.loadTableData();
      },
      buildData(data, _level_node) {
        for (var item of data) {
          item._checked = false;
          item._indeterminate = false;
          item._level_node = _level_node;
          if (item.is_leaf == "否") {
            item._children = [];
          }
          if (item._children && item._children.length > 0) {
            this.buildData(item._children, false);
          }
        }
      },
      handleSelectChange(row) {
        var is_select = row["_checked"];
        var no_value = row[this.noCol];
        row["_indeterminate"] = false;

        //查找子节点 设置和父节点状态一致
        for (var item of this.gridData) {
          if (item[this.parentCol] == no_value) {
            item["_checked"] = is_select;
          }
        }
        this.setFatherCheck(row);
      },
      setFatherCheck(row) {
        var is_select = row["_checked"];

        //检查同级节点的选中状态
        var same = this.checkSelectState(row);

        //操作父节点
        var parent_value = row[this.parentCol];

        if (is_select) {
          if (!row["_level_node"]) {
            for (var item of this.gridData) {
              if (item[this.noCol] == parent_value) {
                if (same) {
                  item["_indeterminate"] = false;
                } else {
                  item["_indeterminate"] = true;
                }

                item["_checked"] = is_select;
                if (!item["_level_node"]) {
                  this.setFatherCheck(item);
                }
              }
            }
          }
        } else {
          for (var item of this.gridData) {
            if (item[this.noCol] == parent_value) {
              if (same) {
                item["_checked"] = false;
                item["_indeterminate"] = false;
              } else {
                item["_checked"] = true;
                item["_indeterminate"] = true;
              }
              this.setFatherCheck(item);
            }
          }
        }
      },
      checkSelectState(row) {
        //检查同级状态是否一致

        var is_same = true;
        var parent_value = row[this.parentCol];
        var is_select = row["_checked"];
        for (var item of this.gridData) {
          if (
            item[this.parentCol] == parent_value &&
            (is_select != item["_checked"] ||
              item["_indeterminate"] != row["_indeterminate"])
          ) {
            is_same = false;
            break;
          }
        }
        return is_same;
      },
      handleCurrentChange(val) {
        this.gridPage.currentPage = val;
        this.loadTableData();
      },

      handleSizeChange(val) {
        this.gridPage.pageSize = val;
        this.loadTableData();
      },

      onAddExecutorComplete(response) {
        

        if (response.request.data && response.request.data.length > 0) {


          let list = response.request.data;
          let parentKeyVal = list[0][this.parentCol];
          let keyVal = list[0][this.noCol];
          // 处理 如果没有 keyval 的情况
          if(!keyVal && response.body.state === "SUCCESS" && response.body.response[0] && response.body.response[0].response.effect_data[0]){
            list = response.body.response[0].response.effect_data[0]
            keyVal = list[this.noCol]
          }
          this.mergeAdd(parentKeyVal, keyVal);
        }
      },

      mergeAdd(parentKeyVal, keyVal, addedRow) {
        let self = this
        function innerAddFunc(addedNode) {
          addedNode._level = 0;
          addedNode._expanded = false;

          // loop over list find its parent by match node.no == added.parentno
          // let insertPosi = this.gridData.length;   // 在末尾插入
          let insertPosi = 0;    // 在开始插入

          let parents = this.gridData.filter(item => item[this.noCol] == parentKeyVal);
          if (parents.length > 0) {
            let parent = parents[0];

            addedNode._level = (parent._level || 0) + 1;

            if (parent._children && parent._children.length > 0) {
              // insert item into parent._children if any
              // add as first child
              parent._children.splice(0, 0, addedNode);
            }

            // change to non_leaf if is leaf
            if (parent.is_leaf == '是') {
              parent.is_leaf = '否';
            }

            if (parent._expanded) {
              let start = this.findPosi(parent);
              for (let i = start; i < this.gridData.length; i++) {
                let str = self.gridData[i].path
                if (!str.startsWith(parent.path)) {
                  insertPosi = i;
                  break;
                }else{

                }
              }
              if(self.gridData.length > 0 && insertPosi === 0){
                insertPosi = self.gridData.length ++

              }
              this.gridData.splice(insertPosi, 0, addedNode);
            } else {
              parent._expanded = false;
            }
          } else {
            // insert the item into top list
            insertPosi = 0
            this.gridData.splice(0, 0, addedNode);  // 在顶部插入
          }
        }

        if (addedRow) {
          innerAddFunc.call(this, addedRow);
        } else {
          let conditions = [{
            colName: this.noCol,
            ruleType: "eq",
            value: keyVal
          }];

          return this.select(this.service_name, conditions).then(response => {
            if (response && response.data && response.data.data && response.data.data.length > 0) {
              let addedNode = response.data.data[0];
              innerAddFunc.call(this, addedNode);
            }
          });
        }

      },

      mergeDelete(parentKeyVal, keyVal) {
        // get the deleted node
        let targets = this.gridData.filter(item => item[this.noCol] == keyVal);
        if (targets.length == 0) {
          return;
        }

        // loop over list find it, delete its subtree
        let target = targets[0];
        _.remove(this.gridData, item => item.path.startsWith(target.path))
        // hack to fix the _.remove not play nice with vue
        this.gridData = [...this.gridData]

        // loop over list find its parent by match node.no == added.parentno
        let parents = this.gridData.filter(item => item[this.noCol] == parentKeyVal);
        if (parents.length > 0) {
          let parent = parents[0];

          // remove it from parent._children
          if (parent._children && parent._children.length > 0) {
            // remove from parent._children
            _.remove(parent._children, item => item[this.noCol] == target[this.noCol]);

            // change to leaf is children is null
            // since parent of delete node is surelly expanded
            if (parent._children.length == 0) {
              parent.is_leaf = '是';
            }
          }
        }
      },

      onUpdateExecutorComplete(response) {
        if (response.request.data && response.request.data.length > 0) {


          // condition is always id = x
          let targetId = response.request.condition[0].value;
          let oldRow = this.gridData.filter(row => row.id == targetId)[0];
          let newRow = response.request.data[0];
          this.mergeUpdate(oldRow, newRow);
        }
      },

      mergeUpdate(oldRow, newRow) {
        if (newRow.hasOwnProperty(this.parentCol) && newRow[this.parentCol] != oldRow[this.parentCol]) {
          // parent changed
          let oldParent = oldRow[this.parentCol];
          let newParent = newRow[this.parentCol];
          let keyVal = oldRow[this.noCol];

          this.mergeDelete(oldParent, keyVal);
          this.mergeAdd(newParent, keyVal);

        } else {
          this.mergeRow(oldRow, newRow);
        }
      },

      findPosi(node) {
        for (let i in this.gridData) {
          if (this.gridData[i][this.noCol] == node[this.noCol]) {
            return parseInt(i);
          }
        }

        return Number.NEGATIVE_INFINITY;
      },

      mergeRow(base, ext) {
        for (let key in ext) {
          base[key] = ext[key];
        }
      },

      onAddFormActionComplete(action) {
        if (action == "submit") {
          this.activeForm = null;
        }
      },

      onUpdateFormActionComplete(action) {
        if (action == "submit") {
          this.activeForm = null;
        }
      },

      onAddChildFormActionComplete(action) {
        if (action == "submit") {
          this.activeForm = null;
        }
      }
    },

    computed: {

      maxTableHeight() {
        let ratio = 0.8;
        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return h * ratio;
      }
    },

    created: function () {
    //   if (this.isListTopComp() && this.$route && this.$route.query) {
    // // if (this.$route && this.$route.query) {
    //     var operate_params = this.getOperateParams();
    //     if (operate_params != "" && operate_params != null ) {
    //       var operate_Object = JSON.parse(operate_params);
    //       // this.service_name = operate_Object["serviceName"] ;
    //       if(typeof operate_Object ==='object'){
    //         this.service_name = operate_Object["serviceName"] ? operate_Object["serviceName"] : this.service ? this.service : this.service_name;
    //         this.$route.params.service_name
    //         if (
    //           operate_Object["condition"] != undefined &&
    //           operate_Object["condition"] != null
    //         ) {
    //           this.custCondition = operate_Object["condition"];
    //         }
    //       }
    //     }else{
    //       this.service_name = this.service?this.service:this.service_name // this.service list 组件 props service 优先使用
    //     }
    //     var selectType = this.$route.query.selectType;
    //     if (selectType != undefined && selectType != "" && selectType != null) {
    //       this.defaultapi = "selectByUser";
    //     }
    //   }
      this.initGridData(true);

      if (this.pageSize != undefined) {

        this.gridPage.pageSize = this.pageSize;
      }
    }
  };
</script>

<style lang="less">

</style>


