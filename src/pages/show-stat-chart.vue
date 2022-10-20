<template>
  <div>
    <query-chart ref="chart" :chart_id="id"
                 @chart-data-loaded="onChartDataLoaded"
    >
    </query-chart>

    <el-row type="flex" class="row-bg" justify="center">

      <el-table :data="gridData" stripe style="width: 100%" border>
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


  import Detail from "../components/common/detail";
  import QueryChart from "./query-chart";

  export default {
    components: {QueryChart, Detail},

    mixins: [],

    props: {},

    computed: {
      gridHeader: function () {
        if (this.refsLoaded && this.$refs.chart.headers) {
          let chart = this.$refs.chart;
          return chart.headers.map(item => {
            return {
              colName: item,
              label: item,
            }
          });
        }
      }
    },

    data() {
      return {
        id: null,
        refsLoaded: false,
        gridData: null,


        gridPage: {
          pageNo: 1,
          rownumber: 15
        },
      }

    },

    methods: {
      onChartDataLoaded: function () {
        let chart = this.$refs.chart;

        this.select(chart.service, chart.condition, this.gridPage, chart.order, chart.group)
          .then(response => {
            if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
              
              throw "err";
            }

            this.gridData = response.data.data;
            if (response.body.page) {
              this.gridPage.currentPage = response.body.page.pageNo;
              this.gridPage.total = response.body.page.total;
            }
          })
      },

      handleCurrentChange(val) {
        this.gridPage.currentPage = val;
        this.onChartDataLoaded();
      },

      handleSizeChange(val) {
        this.gridPage.pageSize = val;
        this.onChartDataLoaded();
      },
    },

    created: function () {
      window.form = this;

      this.id = parseInt(this.$route.params.chartid);
     
    },

    mounted: function () {
      this.refsLoaded = true;

    }

  };
</script>
