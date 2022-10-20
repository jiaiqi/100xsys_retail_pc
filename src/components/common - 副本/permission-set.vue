<template>

  <div>

    <el-col :span="12">
      <el-input v-model="searchContent" @change="searchData" placeholder="请输入查询内容">

      </el-input>
    </el-col>

    <el-table :data="gridData" border @filter-change="filterChange" @sort-change="handleSortChange" ref="treegrid">

      <el-table-column width="250" v-for="(item, index) in gridHeader" :key="index" v-if="item.column==firstColumn" :label="item.label" show-overflow-tooltip>

        <template slot-scope="scope">

          <span v-for="(space, levelIndex) in scope.row._level" :key="levelIndex" class="ms-tree-space">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

          <span class="button is-outlined is-primary is-small" v-if="toggleIconShow(scope.row)" @click="toggle(scope.row)">
            <i v-if="!scope.row._expanded" class="el-icon-plus" aria-hidden="true"></i>
            <i v-if="scope.row._expanded" class="el-icon-minus" aria-hidden="true"></i>
          </span>
          <span v-else class="ms-tree-space"></span>
          <span :title="scope.row[firstColumn]">
            {{scope.row[key_disp_col]}}
          </span>
        </template>

      </el-table-column>

      <el-table-column align="center" v-for="(item, index) in gridHeader" :key="index" v-if="item.show&&item.column!=firstColumn" :width="item.width" :prop="item.column" :label="item.label" :filters="item.filters" :column-key="item.column" :sortable="item.sortable==true?'custom':false">

        <template slot-scope="scope">

          <el-checkbox v-if="scope.row['is_leaf']=='是'" @change="dataChange(scope.row,$event)" v-model="scope.row[item.column]"></el-checkbox>

          <el-checkbox v-if="scope.row['is_leaf']=='否'" @change="dataParentChange(scope.row,item.column,$event)" v-model="scope.row[item.column]"></el-checkbox>
        </template>

      </el-table-column>

      </el-table-column>

      <el-table-column fixed="right" label="全选" width="200">
        <template slot-scope="scope">

          <el-checkbox v-model="scope.row.selectAll" v-if="scope.row.is_leaf=='是'" :indeterminate="scope.row.selectindeterminate" @change="dataAllChange(scope.row,$event)"></el-checkbox>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>
function deepClone(obj) {
  if (obj == null) return null;
  let newObj = obj instanceof Array ? [] : {};
  for (var i in obj) {
    newObj[i] = typeof obj[i] == "object" ? deepClone(obj[i]) : obj[i];
  }
  return newObj;
}

var removeByValue = function(sourceData, val) {
  //对数组原型添加删除指定项的方法
  for (var i = 0; i < sourceData.length; i++) {
    if (sourceData[i] == val) {
      sourceData.splice(i, 1);
      break;
    }
  }
};

import { GridInfo } from "../model/GridInfo";

export default {
  name: "treegrid",

  props: {
    service: {
      type: String
    },
    searchForm: {
      type: Boolean,
      default: function() {
        return true;
      }
    },
    listType: {
      type: String,
      default: function() {
        return "list";
      }
    },
    defaultCondition: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      searchContent: "",
      noCol: "",
      parentCol: "",
      firstColumn: null,
      selectFormShow: false,
      gridHeaderRender: false,
      multipleSelection: [],
      gridHeader: [],
      key_disp_col: "",
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
        pageSize: 5,
        currentPage: 1,
        total: 0
      }
    };
  },
  methods: {
    searchData(data) {
      this.loadTableData(data);
    },
    dataAllChange(row, is_selected) {
      for (var item of this.gridHeader) {
        let _is_app_col = item["_is_app_col"];
        if (_is_app_col) {
          row[item.column] = is_selected;
        }
      }
    },
    dataChange(row, is_selected) {
      this.rowSelectState(row);
    },
    dataParentChange(row, col, is_selected) {

      this.setChildDataState(row._subset,col,is_selected);
      
    },
    setChildDataState(listData,col,state){

      for(var item of listData){
         if(item._subset){
           this.setChildDataState(item._subset,col,state);
         }
         item[col]=state;
      }

    }
    ,
    rowSelectState(row) {
      //0 一个都没选 1 部门分选中 2 全部选中
      var result = 0;
      var no_select_size = 0;
      for (var item of this.gridHeader) {
        let _is_app_col = item["_is_app_col"];
        if (_is_app_col) {
          if (row[item.column]) {
            result = 1;
          }
          if (!row[item.column]) {
            no_select_size = no_select_size + 1;
          }
        }
      }
      if (result == 1 && no_select_size == 0) {
        result = 2;
      }
      if (result == 2) {
        row.selectAll = true;
      } else {
        row.selectAll = false;
      }
      if (result == 1) {
        row.selectindeterminate = true;
      } else {
        row.selectindeterminate = false;
      }
      return result;
    },
    toggleIconShow(record) {
      if (record.is_leaf == "是") {
        return false;
      } else {
        return true;
      }
    },
    async toggle(rowData) {
      let me = this;
      //展开下级

      let childLen = rowData._subset.length;
      //let childLen = 0;
      if (rowData._expanded) {
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
        }
      } else {
        if (rowData._subset && rowData._subset.length > 0) {
          for (var item of rowData._subset) {
            if (!rowData["_checked"]) {
              item["_checked"] = false;
              item["_indeterminate"] = false;
            }
            item._expanded=false;
            me.gridData.splice(me.gridData.indexOf(rowData) + 1, 0, item);
          }
        } else {


          // var childData = [];
          // var childCondition = [
          //   {
          //     colName: this.parentCol,
          //     value: rowData[this.noCol],
          //     ruleType: "eq"
          //   }
          // ];

          // for (var cMap of this.defaultCondition) {
          //   childCondition.push(cMap);
          // }

          // //加载表格数据
          // await this.select(
          //   this.service_name,
          //   childCondition
          // ).then(response => {
          //   this.buildData(response.body.data, false);
          //   childData = response.body.data;
          // });

          // var data = me.setSpaceIcon(childData, rowData._level);

          // rowData._subset = deepClone(data);

          // let i = 0;
          // for (var item of rowData._subset) {
          //   if (rowData["_checked"]) {
          //     item["_checked"] = true;
          //   }

          //   me.gridData.splice(me.gridData.indexOf(rowData) + i + 1, 0, item);
          //   i++;
          // }
        }
      }
      rowData._expanded = !rowData._expanded;
    },
    getChildFlowId(data, emptyArr) {
      // 获取子级的flowId
      let me = this;
      Array.from(data).forEach(record => {
        emptyArr.push(record[this.noCol]);
        if (record._subset && record._subset.length > 0) {
          let childFlowIdArr = me.getChildFlowId(record._subset, emptyArr);
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
        if (value._subset && value._subset.length > 0) {
          me.setSpaceIcon(value._subset, _level);
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
      if ("ascending" == column["order"]) {
        this.order.push({ colName: column["prop"], orderType: "asc" });
      } else {
        this.order.push({ colName: column["prop"], orderType: "desc" });
      }
      this.loadTableData();
    },
    gridButtonClick(type, exeservice, tab_name) {
      if ("select" == type) {
        this.selectFormShow = true;
      } else if ("shrink" == type) {
        this.selectFormShow = false;
      } else if ("refresh" == type) {
        this.loadTableData();
      } else if ("delete" == type) {
        this.batchDeleteData(exeservice);
      } else if ("add" == type) {
        let urlParams = "/" + exeservice;
        this.addTab("simple-add", urlParams, tab_name);
      }
    },
    batchDeleteData(exeservice) {
      this.multipleSelection = [];
      for (var item of this.gridData) {
        if (item["_checked"] && !item["_indeterminate"]) {
          this.multipleSelection.push({ id: item["id"] });
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
    rowButtonClick(type, row, exeservice, tab_name) {
      if ("delete" == type) {
        this.deleteRowData(row, exeservice);
      } else if ("edit" == type) {
        var urlParams = "/" + exeservice + "/" + row.id;
        this.addTab("simple-update", urlParams, tab_name);
      } else if ("detail" == type) {
        var urlParams = "/" + exeservice + "/" + row.id;
        this.addTab("detail", urlParams, tab_name);
      } else if ("addchild" == type) {
        var urlParams = "/" + exeservice + "/" + row.id;
        this.addTab("simple-add", urlParams, tab_name);
      }
    },
    deleteRowData(rowData, exeservice) {
      var dataArray = [rowData];
      this.deleteData(dataArray, exeservice);
    },
    deleteData(deleteRowData, exeservice) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => {
          var deleteRequests = [];
          var request = {};
          request["serviceName"] = exeservice;

          var cMap = { colName: "id", ruleType: "in" };
          var cVule = [];
          for (var item of deleteRowData) {
            cVule.push(item.id);
          }
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
    },
    async initGridData() {
      let gidInfo = new GridInfo();
      this.gridPage.pageSizes = gidInfo.pageSizes;
      await this.select(
        "srvauth_role_permission_v2_select",
        this.defaultCondition,
        null,
        this.order
      ).then(response => {
        let listData = response.body.data["srv_cols"];
        this.gridButton = response.body.data["gridButton"];
        this.rowButton = response.body.data["rowButton"];
        this.srv_cols = listData;
        this.key_disp_col = response.body.data["key_disp_col"];
        this.noCol = response.body.data["no_col"];
        this.parentCol = response.body.data["parent_no_col"];
        this.gridHeader = [];
        var column_index = 0;
        for (var serviceCol of listData) {
          if (serviceCol["columns"] == "id") {
            continue;
          }
          var header = {};

          header["column"] = serviceCol["columns"];
          header["label"] = serviceCol["label"];
          header["width"] = "";
          header["show"] = serviceCol["show"];
          header["_is_app_col"] = serviceCol["_is_app_col"];

          if (column_index == 0) {
            this.firstColumn = serviceCol["columns"];
            column_index++;
          }
          if (
            serviceCol["col_type"] == "Enum" ||
            serviceCol["col_type"] == "Dict"
          ) {
            let filters = [];
            for (var item of serviceCol["option_list_v2"]) {
              filters.push({ text: item["label"], value: item["value"] });
            }

            header["filters"] = filters;
          }

          this.gridHeader.push(header);
        }
      });

      this.loadTableData();
    },
    loadTableData(searchData) {
      this.condition = [];
      var page = {
        pageNo: this.gridPage.currentPage,
        rownumber: this.gridPage.pageSize
      };

      for (var cMap of this.filterCondition) {
        this.condition.push(cMap);
      }

      for (var cMap of this.searchFormCondition) {
        this.condition.push(cMap);
      }

      if (searchData && searchData != "") {
        var cMap = {
          colName: "searchContnet",
          value: searchData,
          ruleType: "like"
        };
        this.condition.push(cMap);
      } else {
        //没有条件的时候初始化只查找父节点
        if (this.condition.length == 0) {
          var initCondition = {
            colName: this.parentCol,
            ruleType: "isnull"
          };
          this.condition.push(initCondition);
        }
      }

      for (var cMap of this.defaultCondition) {
        this.condition.push(cMap);
      }

      //加载表格数据
      this.select(
        this.service_name,
        this.condition,
        page,
        this.order
      ).then(response => {
        this.buildData(response.body.data, true);
        this.gridData = response.body.data;
      });
    },
    query(condtion) {
      this.searchFormCondition = condtion;
      this.gridPage.currentPage = 1;
      this.condition = [];
      this.loadTableData();
    },
    buildData(data, _level_node, spaceLevel) {
      for (var item of data) {
        item._checked = false;
        item._indeterminate = false;
        item["_level_node"] = _level_node;

        // if (item.is_leaf == "否") {
        //   item._subset = [];
        // }
        if (spaceLevel) {
          item["_level"] = spaceLevel + 1;
        } else {
          item["_level"] = 0;
        }
        item._expanded = false;

        if (item._subset && item._subset.length > 0) {
          this.buildData(item._subset, false, item["_level"] + 1);
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
    }
  },
  created: function() {
    this.initGridData();
  }
};
</script>