<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="按照业务导出" name="bizExport">

        <el-row>
          <el-col :span="8">
            <el-select v-model="main_table" filterable placeholder="选择导出入口表" style="width: 100%" @change="clearServcie">
              <el-option v-for="item in table_options" :key="item.table_name" :label="item.table_label" :value="item.table_name">
              </el-option>
            </el-select>
            <el-checkbox v-model="export_no_data">导出无数据关系</el-checkbox>
          </el-col>

          <el-col :span="8">

            <el-button type="primary" icon="el-icon-search" @click="lookData()">查询</el-button>
            <el-button type="primary" icon="el-icon-bottom" @click="exportdml()">导出</el-button>
            <el-button type="primary" icon="el-icon-scissors" @click="stopExport()">终止导出</el-button>

          </el-col>
          <el-col :span="4">
            <el-input v-model="uuid" placeholder="请输入下载附近标识,下载数据文件命中存在"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" icon="el-icon-bottom" @click="downFile()">下载相关附件</el-button>
          </el-col>
        </el-row>
        <el-row>
          <div v-if="service!=''">
            <list ref="biz_table" list-type="list" :service="service"> </list>
          </div>
        </el-row>

      </el-tab-pane>
      <el-tab-pane label="按照结构数据对比导出" name="compareExport">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <span>源数据——{{ source_current_link }} </span>
                <el-checkbox v-model="syscoreData">SYSCORE数据</el-checkbox>
                <el-checkbox v-model="bizData">业务数据</el-checkbox>
                <el-button icon="el-icon-download" @click="exportddl('source_form')" size="small" style="float: right" type="primary">导出升级脚本</el-button>
              </div>
              <el-button type="primary" icon="el-icon-refresh" @click="testConnect('source_form')">点击连接当前应用数据源</el-button>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <span>目标数据——{{ target_current_link }}</span>
              </div>

              <el-row>
                <el-col :span="12">
                  <el-select v-model="target_source_name" filterable placeholder="请选择目标数据源">
                    <el-option v-for="item in target_source_options" :key="item.name" :label="item.name" :value="item.name">
                    </el-option>
                  </el-select>
                </el-col>
                <el-col :span="12">
                  <el-button type="primary" icon="el-icon-refresh" @click="testConnect('target_form')">连接</el-button>
                </el-col>
              </el-row>

            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-button type="text">数据源系统相关表</el-button>
            <el-table border ref="sys_table" :data="
            sysTableData.slice((sysCurrentPage - 1) * pagesize, sysCurrentPage * pagesize)
          " style="width: 100%">
              <el-table-column label="表英文名" prop="TABLE_NAME">
              </el-table-column>

              <el-table-column label="表说明" prop="TABLE_COMMENT">
              </el-table-column>
              <el-table-column label="表类型" prop="TABLE_TYPE" :width="120">
              </el-table-column>
              <el-table-column label="结构" prop="table_structure" align="center" :width="100">
                <template slot="header" slot-scope="scope">
                  结构&nbsp;&nbsp;
                  <el-checkbox @change="sys_stru_select"></el-checkbox>
                </template>
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.table_structure"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column label="数据" prop="table_data" align="center" :width="100">
                <template slot="header" slot-scope="scope">
                  数据&nbsp;&nbsp;
                  <el-checkbox @change="sys_data_select"></el-checkbox>
                </template>
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.table_data" :disabled="scope.row.data_disabled"></el-checkbox>
                </template>
              </el-table-column>
            </el-table>

            <div class="block">
              <el-pagination @current-change="sysHandleCurrentChange" layout="prev, pager, next" :total="source_total" :page-size="pagesize">
              </el-pagination>
            </div>
          </el-col>

          <el-col :span="12">
            <el-button type="text">数据源业务表相关表</el-button>
            <el-table border ref="biz_table" :data="
            bizTableData.slice((bizCurrentPage - 1) * pagesize, bizCurrentPage * pagesize)
          " style="width: 100%">
              <el-table-column label="表英文名" prop="TABLE_NAME">
              </el-table-column>

              <el-table-column label="表说明" prop="TABLE_COMMENT">
              </el-table-column>

              <el-table-column label="表类型" prop="TABLE_TYPE" :width="120"> </el-table-column>
              <el-table-column label="结构" prop="table_structure" align="center" :width="100">
                <template slot="header" slot-scope="scope">
                  结构&nbsp;&nbsp;
                  <el-checkbox @change="biz_stru_select"></el-checkbox>
                </template>

                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.table_structure"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column label="数据" prop="table_data" align="center" :width="100">
                <template slot="header" slot-scope="scope">
                  数据&nbsp;&nbsp;
                  <el-checkbox @change="biz_data_select"></el-checkbox>
                </template>
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.table_data" :disabled="scope.row.data_disabled"></el-checkbox>
                </template>
              </el-table-column>
            </el-table>

            <div class="block">
              <el-pagination @current-change="bizHandleCurrentChange" layout="prev, pager, next" :total="target_total" :page-size="pagesize">
              </el-pagination>
            </div>
          </el-col>
        </el-row>

      </el-tab-pane>

    </el-tabs>

  </div>
</template>
<script>
import list from "./list";

export default {
  components: {
    list
  },
  props: {},
  data() {
    return {
      service: "",
      uuid: "",
      table_options: [],
      main_table: "",
      activeName: "bizExport",
      export_no_data: true,
      target_source_name: "",
      target_source_options: [],
      source_current_link: "未连接",
      target_current_link: "未连接",
      syscoreData: true,
      bizData: true,
      pagesize: 15,
      source_total: 0,
      target_total: 0,
      sysTableData: [],
      bizTableData: [],
      sysCurrentPage: 0,
      bizCurrentPage: 0
    };
  },
  methods: {
    exportdml() {
      var deleteRowData = this.$refs["biz_table"].multipleSelection;
      if (deleteRowData.length == 0) {
        this.$message({
          showClose: true,
          message: "请选择导出数据",
          type: "error"
        });
      } else {
        var cVule = [];
        for (var item of deleteRowData) {
          cVule.push(item.id);
        }
        var ids = cVule.toString();
        var condition = [];
        condition.push({
          colName: "tableName",
          value: this.main_table,
          ruleType: "eq"
        });
        condition.push({
          colName: "ids",
          value: ids,
          ruleType: "eq"
        });
        if (this.export_no_data) {
          condition.push({
            colName: "export_no_data",
            value: "1",
            ruleType: "eq"
          });
        } else {
          condition.push({
            colName: "export_no_data",
            value: "0",
            ruleType: "eq"
          });
        }
        this.bizExport(
          "srvsys_by_biz_export",
          condition,
          null
        ).then(response => {
          var uuid = response.body.data.uuid;

          this.downloadexport(uuid);
        });
      }
    },
    downFile() {
      if (this.uuid == "") {
        this.$message({
          showClose: true,
          message: "请输入下载附近标识",
          type: "error"
        });
      } else {
        this.downloadexport(this.uuid);
      }
    },
    stopExport() {
      var request = [{ serviceName: "srvsys_biz_export_stop" }];
      this.operate(request).then(response => {
        if (response.body.state == "SUCCESS") {
          this.$message({
            type: "success",
            message: "终止成功!"
          });
        } else {
          this.$message({
            showClose: true,
            message: " 终止异常",
            type: "error"
          });
        }
      });
    },
    exportddl() {
      if (this.source_current_link == "未连接") {
        this.$message({
          showClose: true,
          message: "请连接数据源",
          type: "error"
        });
      } else if (this.target_current_link == "未连接") {
        this.$message({
          showClose: true,
          message: "请连接目标数据源",
          type: "error"
        });
      } else {
        var listData = [];
        var dataMap = {};

        dataMap["sysTableData"] = this.sysTableData;
        dataMap["bizTableData"] = this.bizTableData;
        dataMap["syscore"] = this.syscoreData;
        dataMap["bizdata"] = this.bizData;
        dataMap["target_source_name"] = this.target_source_name;

        listData.push(dataMap);

        this.bizExport(
          "srvsys_upgrade_increment_script_export",
          null,
          listData
        ).then(response => {
          var uuid = response.body.data.uuid;

          this.downloadexport(uuid);
        });
      }
    },
    lookData() {
      if (this.main_table == "") {
        this.$message({
          showClose: true,
          message: "请选择数据表",
          type: "error"
        });
      } else {
        if (this.main_table.startsWith("bx")) {
          this.service = "srv" + this.main_table.substring(2) + "_select";
        }
      }
    },
    clearServcie(item) {
      this.service = "";
    },
    sys_stru_select(value) {
      for (var map of this.sysTableData) {
        map.table_structure = value;
      }
    },
    sys_data_select(value) {
      for (var map of this.sysTableData) {
        if (!map.data_disabled) {
          map.table_data = value;
        }
      }
    },
    biz_stru_select(value) {
      for (var map of this.bizTableData) {
        map.table_structure = value;
      }
    },
    biz_data_select(value) {
      for (var map of this.bizTableData) {
        if (!map.data_disabled) {
          map.table_data = value;
        }
      }
    },
    sysHandleCurrentChange(val) {
      this.sysCurrentPage = val;
    },
    bizHandleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.bizCurrentPage = val;
    },
    testConnect(formName) {
      var formData = {};
      var condition = [];
      condition.push({
        colName: "db_type",
        value: formName,
        ruleType: "eq"
      });
      if (formName == "source_form") {
        this.source_current_link = "未连接";
        formData = this.source;
      } else {
        if (this.target_source_name == "") {
          this.$message({
            showClose: true,
            message: "请选择目标数据源",
            type: "error"
          });
          return;
        }
        this.target_current_link = "未连接";
        formData = this.target;

        condition.push({
          colName: "name",
          value: this.target_source_name,
          ruleType: "eq"
        });
      }

      this.select("srvsys_database_table_select", condition).then(response => {
        if (response.body.state == "SUCCESS") {
          if (formName == "source_form") {
            this.sysTableData = response.body.sysTable;
            this.bizTableData = response.body.bizTable;
            var source_info = response.body.source_info;
            this.target_source_options = response.body.target_source_options;

            this.source_current_link =
              "当前连接" + source_info.ip + "/" + source_info.dataBase + "";
            this.source_total = this.sysTableData.length;
            this.target_total = this.bizTableData.length;
            if (this.source_total > 0) {
              this.sysCurrentPage = 1;
            }
            if (this.target_total > 0) {
              this.bizCurrentPage = 1;
            }
          } else {
            var source_info = response.body.source_info;
            this.target_current_link =
              "当前连接" + source_info.ip + "/" + source_info.dataBase + "";
          }
        } else {
          this.$message({
            showClose: true,
            message: "连接异常",
            type: "error"
          });
        }
      });
    }
  },
  created: function() {
    var condition = [];
    this.select("srvsys_table_defined_select", condition).then(response => {
      if (response.body.state == "SUCCESS") {
        this.table_options = [];
        var dataTabes = response.body.data;

        for (var item of dataTabes) {
          this.table_options.push({
            table_name: item.table_name,
            table_label: item.table_label + "/" + item.table_name
          });
        }
      } else {
        this.$message({
          showClose: true,
          message: "连接异常",
          type: "error"
        });
      }
    });
  },
  mounted: function() {}
};
</script>

<style scoped>

</style>