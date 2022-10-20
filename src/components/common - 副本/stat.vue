<template>
  <div>
    <div v-if="searchForm">
      <simple-filter :service="service_name"
                     v-on:search-clicked="query"
                     ref="filter-form"
                     @form-loaded="onFilterFormLoaded($refs['filter-form'])">
      </simple-filter>
    </div>

    <el-row type="flex" class="row-bg" justify="end">
      <div class="table-head-btns">
        <template v-for="(item, index) in gridButton">

          <el-button type="primary" :key="index"
                     @click="gridButtonClick(item)">
            {{item.button_name}}
          </el-button>
        </template>
      </div>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center">
      <el-table :data="gridData" stripe style="width: 100%" border
                :span-method="objectSpanMethod"
      >

        <el-table-column v-for="(header, key) in gridHeader" :key="key"
                         :prop="header.colName"
                         :label="header.label"
                         sortable="false">
        </el-table-column>
      </el-table>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center"
            v-show="gridPage.total>0">
      <el-pagination @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"
                     :current-page="gridPage.currentPage"
                     :page-sizes="gridPage.pageSizes"
                     :page-size="gridPage.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="gridPage.total">
      </el-pagination>
    </el-row>

  </div>
</template>

<script>
  import {GridInfo} from "../model/GridInfo";
  import simpleFilter from "./simple-filter";
  import SimpleAdd from "./simple-add";
  import SimpleUpdate from "./simple-update";
  import ListPopupMixin from "../mixin/list-popup-mixin";

  import Vue from "vue";

  export default {
    components: {
      SimpleUpdate,
      SimpleAdd,
      simpleFilter
    },

    mixins: [ListPopupMixin],

    data() {
      return {
        service_name: this.service || this.$route.params.service_name,
        selectFormShow: false,
        gridHeader: [],
        selection: true,
        gridData: [],
        gridButton: [],
        multipleSelection: [],
        condition: [],
        order: [],
        group: [],
        searchFormCondition: [],
        srv_cols: null,
        keyValueData: {},
        filterCondition: [],
        gridPage: {
          pageSizes: [],
          pageSize: 10,
          currentPage: 1,
          total: 0
        },

        activeForm: null,
        clickedRow: {},
      };
    },

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
    },

    methods: {

      objectSpanMethod({row, column, rowIndex, columnIndex}) {
        if (!this.group || this.group.length == 0) {
          return {
            rowspan: 1,
            colspan: 1
          };
        } else {
          let columnKey = column.property;
          let isGroupColumn = this.group.filter(group => group.type.startsWith("by") && group.colName == columnKey);
          if (isGroupColumn) {
            let sameLastRow = rowIndex > 0 && this.gridData[rowIndex][columnKey] == this.gridData[rowIndex - 1][columnKey];
            if (!sameLastRow) {
              let rowspan = 1;
              for (var i = rowIndex + 1; i < 1000; i++) {
                if (this.gridData[i] && this.gridData[i][columnKey] == this.gridData[rowIndex][columnKey]) {
                  rowspan++;
                } else {
                  break;
                }
              }


              return {
                rowspan: rowspan,
                colspan: 1
              };
            } else {
              return {
                rowspan: 0,
                colspan: 0
              };
            }
          }
        }
      },

      gridButtonClick(item) {
        let type = item.button_type;
        if ("select" == type) {
          this.selectFormShow = true;
        } else if ("shrink" == type) {
          this.selectFormShow = false;
        } else if ("refresh" == type) {
          this.loadTableData();
        }
      },



      handleCurrentChange(val) {
        this.gridPage.currentPage = val;
        this.loadTableData();
      },

      handleSizeChange(val) {
        this.gridPage.pageSize = val;
        this.loadTableData();
      },

      query(condtions, groups, headers) {
        this.searchFormCondition = condtions;
        this.group = groups;
        this.gridHeader = headers;
        this.gridPage.currentPage = 1;
        this.condition = [];

        this.loadTableData();
      },

      loadTableData() {
        this.condition = [];
        var page = {
          pageNo: this.gridPage.currentPage,
          rownumber: this.gridPage.pageSize
        };

        for (var cMap of this.searchFormCondition) {
          this.condition.push(cMap);
        }

        //加载表格数据
        this.select(
          this.service_name,
          this.condition,
          page,
          this.order,
          this.group,
        ).then(response => {
          this.gridData = response.body.data;
          var listData = response.body.data;
          if (!listData) {
            return;
          }

          for (var row of listData) {
            for (var key in this.keyValueData) {
              var listdata = this.keyValueData[key];

              for (var map of listdata) {
                if (row[key] == map["value"]) {
                  row[key] = map["text"];
                  break;
                }
              }
            }
          }
          this.gridPage.currentPage = response.body["page"]["pageNo"];
          this.gridPage.total = response.body["page"]["total"];
        });

      },

      initGridData() {
        let gidInfo = new GridInfo();
        this.gridPage.pageSizes = gidInfo.pageSizes;
        this.selection = gidInfo.selection;
        this.searchForm = true;
      },

      onFilterFormLoaded: function (form) {
        
        this.$refs['filter-form'].onSearchClicked();

        this.$emit('filter-form-loaded', form);
      },

    },
    created: function () {
      this.initGridData();
    },
    mounted: function () {

    }
  };
</script>


<style lang="less">
  #app {
    > div {
      > .el-row {
        > .isFixed.el-table {
          > .el-table__header-wrapper {
            position: fixed;
            top: 0;
            z-index: 3;
          }
          .el-table__fixed-header-wrapper {
            top: 0;
            position: fixed;
            // padding: 12px 0;
            z-index: 4;
            // overflow: hidden;
            right: 0.5rem;
            > table {
              > thead {
                tr {
                  background-color: transparent;
                  th {
                    background-color: transparent;
                    opacity: 0;
                    // display: none;
                  }
                  th:last-child {
                    background-color: #fff;
                    opacity: 1;
                    padding: 12px 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>


