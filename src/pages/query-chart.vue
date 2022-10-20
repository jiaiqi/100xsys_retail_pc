<template>
  <div :id="getElId()"
       :style="{width: '100%', height: ( chart && chart.height || '500px')}"
  >
  </div>
</template>

<script>
  import _ from "lodash"

  var echartUid = 0;

  export default {
    components: {
      echarts: () => import(/* webpackChunkName: "echarts" */'echarts')
    },

    mixins: [],

    props: {
      chart_id: {
        type: String,
      },

      chart_no: {
        type: String,
      },
    },

    data() {
      return {
        colors: [
          '#00bfff',
          '#ff4500',
          '#808080',
          '#ffa500',
          '#4169e1',
          '#228b22',
        ],

        echartOptions: {},

        // listmap returned from backend
        listData: null,
        dataset: [],
        headers: [],
        srvCols: [],

        myChart: null,
        uid: null,
        intervalId: null,

        chart: null,
        service: null,
        condition: null,
        group: null,
        order: null,

        grids: [],
        axes: [],
        series: [],
        pieCharts: [],
        gauges: [],

        axisTypeMap: {
          数值轴: "value",
          类目轴: "category",
          时间轴: "time",
          对数轴: "log",
        },

        seriesTypeMap: {
          折线图: "line",
          柱状图: "bar",
          饼图: "pie",
          散点图: "scatter",
        },
        groupName2Label: {
          "by": "按值汇总",
          "by_year": "按年汇总",
          "by_month_of_year": "按月汇总",
          "by_week": "按周汇总",
          "by_date": "按天汇总",
          "by_hour_of_date": "按小时汇总",
          "by_minute": "按分钟汇总",
          "max": "最大",
          "min": "最小",
          "sum": "总和",
          "avg": "平均",
          "distinct_count": "计数(去重去空)",
          "count": "计数(去空)",
        },
      };
    },

    methods: {
      getElId() {
        return "chart_" + this.uid;
      },

      confChart: function () {
        let conditions = [{
          colName: "chart_no",
          ruleType: "eq",
          value: this.chart.chart_no,
        }]

        return this.select("srvsys_stat_axis_select", conditions)
          .then(response => {
            if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
              
              throw "err";
            }

            this.axes = response.data.data;
          })
          .then(_ => {
            return this.select("srvsys_stat_grid_select", conditions)
          })
          .then(response => {
            if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
             
              throw "err";
            }

            this.grids = response.data.data;
          })
          .then(_ => {
            let orders = [{
              colName: "id",
              orderType: "asc",
            }];
            return this.select("srvsys_stat_series_select", conditions, null, orders)
          })
          .then(response => {
            if (!response || !response.data || !response.data.data) {
              
              throw "err";
            }

            this.series = response.data.data;
          })
          .then(_ => {
            let orders = [{
              colName: "id",
              orderType: "asc",
            }];
            return this.select("srvsys_stat_pie_chart_select", conditions, null, orders)
          })
          .then(response => {
            if (!response || !response.data || !response.data.data) {
              
              throw "err";
            }

            this.pieCharts = response.data.data;
          })
          .then(_ => {
            let orders = [{
              colName: "id",
              orderType: "asc",
            }];
            return this.select("srvsys_stat_gauge_select", conditions, null, orders)
          })
          .then(response => {
            if (!response || !response.data || !response.data.data) {
              
              throw "err";
            }

            this.gauges = response.data.data;
          })
          .then(_ => {
            this.setBaseOptions();
            this.setOptions4Cartesian();
            this.setOptions4Pie();
            this.setOptions4Gauge();

            this.myChart.setOption(this.echartOptions, true);
          });
      },

      setBaseOptions: function () {
        this.echartOptions = {
          title: {
            // text: this.chart.chart_name,
            // x: 'center'
          },
          tooltip: {},
          legend: {
            data: this.headers,
          },

          dataset: {
            source: this.dataset
          },
          series: [],
        };

        if (this.chart.hide_toolbox !== "是") {
          this.echartOptions.toolbox = {
            left: 'right',
            feature: {
              dataZoom: {},
              mark: {show: true},
              dataView: {show: true, readOnly: false},
              magicType: {show: true, type: ['line', 'bar']},
              restore: {show: true},
              saveAsImage: {show: true},
            }
          }
        }
      },


      setOptions4Cartesian: function () {
        if (!this.series || this.series.filter(item => item.visible === "是").length == 0) {
          return;
        }

        this.echartOptions.grid = this.grids.map(item => {
          let grid = {};
          if (_.isNumber(item.grid_top)) {
            grid.top = item.grid_top + "%"
          }
          if (_.isNumber(item.grid_left)) {
            grid.left = item.grid_left + "%"
          }
          if (_.isNumber(item.grid_right)) {
            grid.width = (item.grid_right - item.grid_left) + "%"
          }
          if (_.isNumber(item.grid_bottom)) {
            grid.height = (item.grid_bottom - item.grid_top) + "%"
          }
          return grid;
        });

        let xaxes = this.axes.filter(item => item.xory == "X轴").map(item => {
          let xaxisType = this.axisTypeMap[item.axis_type];
          let gridIndex = _.findIndex(this.grids, e => e.grid_no === item.grid_no);
          return {
            type: xaxisType,
            gridIndex: gridIndex,
            name: item.axis_name,
            axis_no: item.axis_no,
          };
        });
        this.echartOptions.xAxis = xaxes;


        let yaxes = this.axes.filter(item => item.xory == "Y轴").map(item => {
          let gridIndex = _.findIndex(this.grids, e => e.grid_no === item.grid_no);
          return {
            type: this.axisTypeMap[item.axis_type],
            gridIndex: gridIndex,
            name: item.axis_name,
            axis_no: item.axis_no,
          }
        });
        this.echartOptions.yAxis = yaxes;

        this.series.filter(item => item.visible === "是")
          .map(item => {
            let yAxisIndex = yaxes.findIndex(axis => axis.axis_no == item.yaxis_no);
            let xAxisIndex = xaxes.findIndex(axis => axis.axis_no == item.xaxis_no);
            let xAxis = _.find(this.axes, axis => axis.axis_no == item.xaxis_no);

            

            let index = this.series.indexOf(item);

            return {
              name: item.y_dim,
              type: this.seriesTypeMap[item.series_type],
              symbolSize: 2.5,
              xAxisIndex: xAxisIndex,
              yAxisIndex: yAxisIndex,
              color: this.colors[index],
              label: {
                normal: {
                  position: 'top',
                  show: true
                }
              },
              encode: {
                x: xAxis.x_dim,
                y: item.y_dim,
                tooltip: [0, 1]
              }
            };
          })
          .forEach(item => this.echartOptions.series.push(item));
      },

      setOptions4Pie: function () {
        this.pieCharts.filter(item => item.visible === "是")
          .map(item => {
            let xDimIndex = _.findIndex(this.headers, h => h === item.x_dim);
            let yDimIndex = _.findIndex(this.headers, h => h === item.y_dim);
            let seriesData = [];
            for (let i in this.dataset) {
              if (i == 0) {
                continue;
              }
              seriesData.push({
                name: this.dataset[i][xDimIndex],
                value: this.dataset[i][yDimIndex],
              });
            }

            let defaultR = 55;
            let r = (item.grid_right && item.grid_left) ? ((item.grid_right - item.grid_left) / 2) : defaultR;
            let radius = r + "%"
            let originX = item.grid_left ? (item.grid_left + r) + "%" : '50%';
            let originY = item.grid_top ? (item.grid_top + r) + "%" : '50%';
            let radiusies = radius
            if (item.grid_left2 && item.grid_right) {
              let r2 = ((item.grid_right - item.grid_left2) / 2)
              let radius2 = r2 + "%"
              radiusies = [radius2, radius];
            }

            return {
              name: item.y_dim,
              type: 'pie',
              radius: radiusies,
              center: [originX, originY],
              data: seriesData,
              tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
              },
              label: {            //饼图图形上的文本标签
                normal: {
                  show: true,
                  position: 'outside', //标签的位置
                },
              },
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            };
          })
          .forEach(item => this.echartOptions.series.unshift(item));
      },

      setOptions4Gauge: function () {
        this.gauges.filter(item => item.visible === "是")
          .map(item => {
            return {
              name: item.name,
              type: 'gauge',
              detail: {formatter: '{value}%'},
              data: [{value: 0, name: item.name}],
              // from gauge conf
              select_service_json: item.select_service_json,
              x_dim: item.x_dim,
            };
          })
          .forEach(item => this.echartOptions.series.unshift(item));
      },

      loadData: function () {
        let chartConditions = [];
        if(this.chart_no){
          chartConditions.push({
            colName: "chart_no", ruleType: "eq", value: this.chart_no
          })
        } else {
          chartConditions.push({
            colName: "id", ruleType: "eq", value: this.chart_id
          })
        }

        return this.select("srvsys_stat_chart_select", chartConditions)
          .then(response => {
            if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
              
              throw "err";
            }
            let chart = response.data.data[0];
            this.chart = chart;
            this.service = chart.service;
            this.condition = chart.conditions && chart.conditions.trim().length > 0 ? eval(chart.conditions) : [];
            this.group = chart.groups && chart.groups.trim().length > 0 ? eval(chart.groups) : null;
            this.order = chart.orders && chart.orders.trim().length > 0 ? JSON.parse(chart.orders) : null;
          })
          .then(_ => {
            return this.loadColsV2(this.service, 'list')
              .then(response => {
                if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
                  
                  throw "err";
                }

                let data = response.body.data;
                this.srvCols = data.srv_cols;
              });
          })
          .then(_ => {
            let page = {
              pageNo: 1,
              rownumber: 15
            };
            return this.select(this.service, this.condition, page, this.order, this.group,)
          })
          .then(response => {
            if (!response || !response.data || !response.data.data || response.data.data.length == 0) {
              
              throw "err";
            }

            // convert the data as echart's convention
            let listData = response.data.data;
            this.listData = listData;
            let headers = [];
            for (let key in listData[0]) {
              headers.push(key);
            }

            this.headers = headers;
            this.dataset = [];
            this.dataset.push(headers);

            for (let i in listData) {
              let map = listData[i];

              let row = [];
              for (let key in map) {
                row.push(map[key]);
              }
              this.dataset.push(row);
            }

            this.$emit("chart-data-loaded");
          });


      },

      refresh: function () {
        this.loadData()
          .then(_ => {
            this.myChart = echarts.init(document.getElementById(this.getElId()));
            this.confChart()
              .then(_ => {
                this.readGaugeValues()
              });
          });
      },

      readGaugeValues: function () {
        let vm = this;

        if (!vm.echartOptions || !vm.echartOptions.series) {
          return;
        }

        // for all gauge, load data and set options
        let loadPromises = vm.echartOptions.series.filter(item => item.type === "gauge")
          .map(item => {
            let serviceJson = this.parseJson(item.select_service_json);
            let serviceInvoke = serviceJson
            return vm.selectOne(serviceInvoke.serviceName, serviceInvoke.condition)
              .then(response => {
                item.data[0].value = response.data[item.x_dim]
              })
          })

        Promise.all(loadPromises)
          .then(_ => {
            vm.myChart.setOption(vm.echartOptions, true)

          })
      }

    },

    created: function () {
      this.uid = echartUid++;
    },

    mounted: function () {
      this.refresh();

      let vm = this
      setInterval(function () {

      }, 10000);
    }

  };
</script>




