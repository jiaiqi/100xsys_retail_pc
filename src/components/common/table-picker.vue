<template>
  <div>
    <el-popover trigger="click" v-model="visible">
      <div slot="reference">
        <el-select
          style="width: 100%"
          v-model="selected"
          :value-key="valueCol"
          popper-class="popper-class"
          placeholder="请选择"
          :multiple="isMulti"
          clearable
          @remove-tag="removeTag"
          @clear="clearSelect"
          @focus="visible = true"
        >
          <el-option
            v-for="item in allData"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="picker-view">
        <div class="top-bar">
          <el-input
            placeholder="输入查询条件"
            suffix-icon="el-icon-search"
            v-model="inputVal"
            clearable
            @keyup.enter.native="onSearch"
          >
          </el-input>
          <el-button type="primary" icon="el-icon-search" @click="onSearch"
            >搜索</el-button
          >
        </div>
        <el-table
          ref="multipleTable"
          :data="gridData"
          :highlight-current-row="!isMulti"
          @row-click="clickRow"
          @selection-change="handleSelectionChange"
        >
          <el-table-column width="50" v-if="isMulti">
            <template slot-scope="scope">
              <el-checkbox
                :value="scope.row.checked"
                @change="changeSelected(scope.$index, scope.row)"
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            width="150"
            :label="item.label"
            v-for="item in setGridHeader"
            :key="item.column"
            v-if="item.srvcol && item.srvcol.in_list == 1"
            :prop="item.column"
          ></el-table-column>
        </el-table>
        <div class="bottom-bar">
          <div></div>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="page.total"
            :current-page="page.pageNo"
            :page-size="page.rownumber"
            @current-change="changePage"
          >
          </el-pagination>

          <!-- <el-button
            size="mini"
            type="primary"
            @click="confirmSelect"
            v-if="tableSelected && tableSelected.length > 0"
            >确认</el-button
          >
          <el-button size="mini" @click="visible = false" v-else
            >取消</el-button
          > -->
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
// import ListMixin from "../mixin/list-mixin"; // 列表js
import { wrapButton, wrapHeader, getButtonPara } from "../common/wrapper_util";

export default {
  props: {
    field: {
      type: Object,
    },
    finderSelected: {
      type: String,
    },
    selectedGridData: {
      type: Array,
    },
    defaultValues: {
      type: Object,
    },
    mainformDatas: {
      type: Object,
    },
  },
  // mixins: [
  //   ListMixin
  // ],
  data() {
    return {
      inputVal: "",

      tableSelected: [],
      selected: [],
      visible: false,
      page: {
        total: 0,
        rownumber: 5,
        pageNo: 1,
      },
      options: [],
      gridHeader: [],
      gridData: [],
      allData: [],
    };
  },
  computed: {
    fieldType() {
      let fieldInfo = this.field.info;
      if (fieldInfo && fieldInfo.type) {
        return fieldInfo.type;
      }
    },
    isMulti() {
      return this.fieldType && ["fks", "fkjsons"].includes(this.fieldType);
    },
    valueCol() {
      return this.fmt && this.fmt.primary_col;
    },
    labelCol() {
      return this.fmt && this.fmt.disp_col;
    },
    fmt() {
      return this.field && this.field.info && this.field.info.fmt;
    },
    setGridHeader() {
      let arr = [];
      let cols = [];
      if (this.fmt && this.fmt.cols && this.fmt.cols.length > 0) {
        this.fmt.cols.forEach((item) => {
          arr.push(item);
        });
      } else {
        if (this.fmt && this.fmt.disp_col) {
          arr.push(this.fmt.disp_col);
        }
        if (this.fmt && this.fmt.primary_col) {
          arr.push(this.fmt.primary_col);
        }
      }
      if (Array.isArray(this.gridHeader)) {
        cols = this.gridHeader.filter((item) => arr.includes(item.column));
      }
      return cols;
    },
  },
  created() {
    this.initSelected();

    this.buildGridHeader();
  },
  methods: {
    initSelected() {
      let obj = {};
      if (["fkjson", "fkjsons"].includes(this.fieldType)) {
        try {
          obj = JSON.parse(this.finderSelected);
        } catch (error) {
          console.log(error);
        }
      }

      if (this.finderSelected)
        switch (this.fieldType) {
          case "fkjson":
            if (obj && obj[this.valueCol]) {
              this.selected = obj[this.valueCol];
            }
            break;
          case "fkjsons":
            if (Array.isArray(obj)) {
              this.selected = obj
                .map((item) => item[this.valueCol])
                .filter((item) => item && item);
            }
            break;
          case "fk":
            this.selected = this.finderSelected;
            break;
          case "fks":
            this.selected = this.finderSelected.split(",");
            break;
        }
    },
    setFieldVal() {
      let val = "";
      if (Array.isArray(this.selected)) {
        switch (this.fieldType) {
          case "fkjsons":
            val = this.allData
              .filter(
                (item) => this.selected.indexOf(item[this.valueCol]) !== -1
              )
              .map((item) => {
                // if (this.labelCol !== "label") {
                //   delete item.label;
                // }
                // if (this.valueCol !== "value") {
                //   delete item.value;
                // }
                delete item.checked;
                return item;
              });
            val = JSON.stringify(val);
            break;
          case "fks":
            val = this.selected.toString();
            break;
        }
        if (this.selected.length === 0) {
          val = "";
        }
      } else if (this.selected) {
        val = this.selected;
        switch (this.fieldType) {
          case "fkjson":
            val = this.allData.find(
              (item) => this.selected.indexOf(item[this.valueCol]) !== -1
            );
            if (val && typeof val === "object") {
              // if (this.labelCol !== "label") {
              //   delete val.label;
              // }
              // if (this.valueCol !== "value") {
              //   delete val.value;
              // }
              delete val.checked;
              val = JSON.stringify(val);
            } else {
              val = null;
            }
            break;
          case "fk":
            val = this.selected;
            break;
        }
      }
      this.$emit("on-selected", val);
    },
    onSearch() {
      this.changePage(1);
    },

    confirmSelect() {
      // this.visible = false
      // this.selected = _.uniq([ ...this.selected, ...this.tableSelected ]);
      // this.tableSelected = []
      // this.$refs.multipleTable.clearSelection();
      this.setFieldVal();
    },
    clearSelect() {
      this.initTableSelection();
      this.setFieldVal();
    },
    removeTag(e) {
      if (e) {
        let val = e;
        // let val = e[ this.valueCol ]
        this.selected = this.selected.filter((item) => item !== val);
        this.initTableSelection();
        this.setFieldVal();
      }
    },
    initTableSelection() {
      if (Array.isArray(this.allData) && this.allData.length > 0) {
        this.gridData = this.gridData.map((item) => {
          if (this.selected.indexOf(item[this.valueCol]) !== -1) {
            item.checked = true;
          } else {
            item.checked = false;
          }
          return item;
        });
      }
    },
    changeSelected(index, row) {
      this.clickRow(row);
      // this.selected = this.allData.filter(item => item[ this.valueCol ] === row[ this.valueCol ])
    },
    clickRow(row) {
      if (this.isMulti) {
        // 多选模式
        this.gridData = this.gridData.map((item) => {
          if (item[this.valueCol] === row[this.valueCol]) {
            item.checked = !item.checked;
            if (item.checked) {
              this.selected.push(item[this.valueCol]);
              this.selected = _.uniq(this.selected);
            } else {
              this.selected = this.selected.filter(
                (e) => e !== item[this.valueCol]
              );
            }
          }
          return item;
        });
        // this.$refs.multipleTable.toggleRowSelection(row);
      } else {
        // 单选模式
        this.selected = row[this.valueCol];
        this.visible = false;
      }

      this.setFieldVal();
    },
    changePage(page) {
      this.page.pageNo = page;
      this.loadOptions();
    },

    handleSelectionChange(val) {
      // this.selected = _.uniq([ ...this.selected, ...this.tableSelected ]);
      // this.tableSelected = val.map(item => item[ this.valueCol ])
      this.confirmSelect();
    },
    async buildGridHeader() {
      if (this.fmt && this.fmt.service) {
        let res = await this.loadColsV2(this.fmt.service, "list");
        let respData = res.body.data;
        let srv_cols = respData["srv_cols"];
        let gridHeader = [];
        for (var serviceCol of srv_cols) {
          let colName = serviceCol["columns"];
          if (colName == "id") {
            continue;
          }

          if (serviceCol.col_type === "InlineList") {
            continue;
          }

          let header = {};
          header.srvcol = serviceCol;
          let more_config =
            serviceCol["more_config"] !== null &&
            serviceCol["more_config"] !== undefined &&
            serviceCol["more_config"] !== ""
              ? JSON.parse(serviceCol["more_config"])
              : null;
          let colType = serviceCol["col_type"];
          header["column"] = colName;
          header["label"] = serviceCol["label"];
          header["width"] = "";
          header["show"] = serviceCol["in_list"] === 1;
          header["sortable"] = true;
          header["col_type"] = colType;
          header["list_min_width"] = serviceCol["list_min_width"];
          header["show_option_icon"] =
            serviceCol["more_config"] &&
            JSON.parse(serviceCol["more_config"]).option_icon &&
            JSON.parse(serviceCol["more_config"]).option_icon !== null
              ? JSON.parse(serviceCol["more_config"]).option_icon
              : false;
          header["align"] = this.getColAlign(colType);
          header["format"] =
            serviceCol["more_config"] &&
            JSON.parse(serviceCol["more_config"]).format &&
            JSON.parse(serviceCol["more_config"]).format !== null
              ? JSON.parse(serviceCol["more_config"]).format
              : null;
          header["more_config"] =
            serviceCol["more_config"] && JSON.parse(serviceCol["more_config"])
              ? JSON.parse(serviceCol["more_config"])
              : null;
          if (
            more_config !== null &&
            more_config.hasOwnProperty("list_width")
          ) {
            header["width"] = more_config.list_width;
          }
          if (more_config !== null && more_config.hasOwnProperty("rowFixed")) {
            header["rowFixed"] = more_config.rowFixed;
          } else {
            header["rowFixed"] = false;
          }
          if (
            more_config !== null &&
            more_config.hasOwnProperty("onListShowExp")
          ) {
            header["showListExp"] = more_config.onListShowExp;
          }
          if (
            serviceCol["col_type"] == "Enum" ||
            serviceCol["col_type"] == "Dict"
          ) {
            let filters = [];
            var option_list_v2 = serviceCol["option_list_v2"];
            if (option_list_v2 && _.isArray(option_list_v2)) {
              for (var item of option_list_v2) {
                filters.push({ text: item["label"], value: item["value"] });
              }
            }
            header["filters"] = filters;
          }
          gridHeader.push(wrapHeader(header));
        }
        this.gridHeader = gridHeader;
        // this.buildGridHeaders(respData[ "srv_cols" ]);
        this.loadOptions();
      }
    },

    loadOptions(query = {}) {
      let fieldInfo = this.field.info;
      let loader = fieldInfo.fmt;
      let queryJson = {
        serviceName: loader.service,
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: this.page.pageNo,
          rownumber: this.page.rownumber,
        },
      };
      if (this.fmt && this.fmt.seq_col) {
        if (this.fmt.order_type) {
          queryJson.order = [
            {
              colName: this.fmt.seq_col,
              orderType: this.fmt.order_type === "升序" ? "asc" : "desc",
            },
          ];
        }
      }

      let fmtConditions = this.fmt.condition;
      if (Array.isArray(fmtConditions) && fmtConditions.length > 0) {
        for (var condition of fmtConditions) {
          let obj = {
            colName: condition.colName,
            ruleType: condition.ruleType,
            value: condition.value,
          };
          if (typeof condition.value === "object") {
            if (condition.value["value_type"] == "constant") {
              obj.value = condition.value["value"];
            } else if (condition.value["value_type"] == "sysvar") {
              if (condition.value["value"] == "nowdate") {
                obj.value = this.formatDateTime(new Date());
              } else {
                obj.value = eval("top." + condition.value["value"]);
              }
            } else if (condition.value["value_type"] == "rowData") {
              if (
                this.defaultValues &&
                this.defaultValues[condition.value["value_key"]]
              ) {
                obj.value = this.defaultValues[condition.value["value_key"]];
              } else {
                obj.value = null;
              }
            } else if (condition.value["value_type"] == "mainData") {
              // 主表数据
              if (
                this.mainformDatas &&
                typeof this.mainformDatas === "object" &&
                this.mainformDatas[condition.value["value_key"]]
              ) {
                obj.value =
                  this.mainformDatas[condition.value["value_key"]] || null;
              }
            }
          }
          queryJson.condition.push(obj);
        }
      }

      if (this.inputVal) {
        let relation_condition = {
          relation: "OR",
          data: [
            {
              relation: "AND",
              data: [
                {
                  colName: this.valueCol,
                  value: this.inputVal,
                  ruleType: "[like]",
                },
              ],
            },
            {
              relation: "AND",
              data: [
                {
                  colName: this.labelCol,
                  value: this.inputVal,
                  ruleType: "[like]",
                },
              ],
            },
          ],
        };
        queryJson.relation_condition = relation_condition;
      }

      if (Array.isArray(this.setGridHeader) && this.setGridHeader.length > 0) {
        queryJson.colNames = this.setGridHeader.map((item) => item.column);
      }

      if (loader && loader.orders) {
        queryJson.order = loader.orders;
      }
      
      return this.selectList(queryJson).then((response) => {
        if (response && response.data && response.data.data) {
          let options = [];
          if (this.page.pageNo !== 1) {
            options = [...this.gridData, ...response.data.data];
          } else {
            options = response.data.data;
          }
          this.gridData = _.cloneDeep(response.data.data).map((item) => {
            item.checked = false;
            return item;
          });
          let allData = _.uniqBy(
            [
              ...this.gridData,
              ...this.allData,
              ..._.cloneDeep(this.selectedGridData),
            ],
            this.valueCol
          );
          this.allData = _.cloneDeep(allData).map((item) => {
            item.label = item[this.labelCol];
            item.value = item[this.valueCol];
            return item;
          });
          this.initTableSelection();
          if (response.body.page) {
            this.page.total = response.body.page.total;
          }
        }
      });
    },
    getColAlign: function(colType) {
      if (
        colType === "Money" ||
        colType === "int" ||
        colType === "Integer" ||
        colType === "Email" ||
        colType === "TelNo"
      ) {
        return "right";
      } else if (
        colType === "Enum" ||
        colType === "Dict" ||
        colType === "Date" ||
        colType === "DateRange" ||
        colType === "DateTime"
      ) {
        return "center";
      } else {
        return "left";
      }
    },
  },
};
</script>

<style lang="scss">
.popper-class {
  display: none;
}
.bottom-bar,
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  .el-input {
    flex: 1;
    margin-right: 10px;
  }
}
.bottom-bar {
  justify-content: center;
}
.el-table th {
  padding: 0 4px !important;
}
.el-table th > .cell {
  padding: 8px;
}
</style>
