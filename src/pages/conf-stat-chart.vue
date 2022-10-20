<template>
  <div>
    <detail ref="detail"
            service="srvsys_stat_chart_select"
            :pkid="id"
            @update-form-loaded="onUpdateFormLoaded"
            @add-form-loaded="onAddFormLoaded"
            @list-loaded="onChildListLoaded"
    >
    </detail>
    <div style="margin-left: 25px; margin-top: 15px">
      图表预览：
      <el-button @click="$refs.chart && $refs.chart.refresh();">
        刷新
      </el-button>
    </div>
    <query-chart ref="chart" :chart_id="id">
    </query-chart>
  </div>

</template>

<script>
  import Detail from "../components/common/detail";
  import QueryChart from "./query-chart";
  import {ActionInfo} from "../components/model/ActionInfo";

  export default {
    components: {QueryChart, Detail},

    mixins: [],

    props: {},

    computed: {
      dims: function () {
        let simpleDetail = this.$refs.detail.$refs['simple-detail'];
        let col_names = simpleDetail.fields.col_names.getSrvVal();
        let groups = simpleDetail.fields.groups.getSrvVal();
        if (groups && groups.trim()) {
          return eval(groups).map(item => item.aliasName || item.colName);
        } else {
          return col_names.split(",").map(item => {
            if (item.includes(" as ")) {
              let parts = item.split("as");
              return parts.length >= 2 ? parts[1].trim() : parts[0].trim();
            } else {
              return item.trim()
            }
          });
        }
      }
    },

    data() {
      return {
        id: this.$route.params.chartid,
      }

    },

    methods: {
      onChildListLoaded(childlist) {
        childlist.$refs.list.gridButton
          .filter(item => item.button_type === "batchupdate" || item.button_type === "saveall")
          .forEach(item => item.permission = false)
      },

      onAddFormLoaded(form) {
        this.decorateFormOptionsVisible(form);

        // set default vaulues
        let xAxisField = form.fields.xaxis_no;
        let yAxisField = form.fields.yaxis_no;

        if (xAxisField && yAxisField) {
          let simpleDetail = this.$refs.detail.$refs['simple-detail'];
          let axes = simpleDetail.srvValFormModel()._children["bxsys_stat_axis_fk1"];
          let xaxis_no = _.find(axes, item => item.xory === 'X轴').axis_no;
          if (xaxis_no) {
            form.fields.xaxis_no.setSrvVal(xaxis_no);
          }

          let yaxis_no = _.find(axes, item => item.xory === 'Y轴').axis_no;
          if (yaxis_no) {
            form.fields.yaxis_no.setSrvVal(yaxis_no);
          }
        }
      },

      onUpdateFormLoaded(form) {
        this.decorateFormOptionsVisible(form);
      },


      decorateFormOptionsVisible: function (form) {
        // decorate for series form
        if (form.service_name && !form.service_name.includes("gauge")) {
          this.decorateDimField(form.fields.x_dim);
          this.decorateDimField(form.fields.y_dim);
        }

        // hide x_dim in axis form if axis_type is x
        let xoryField = form.fields.xory;
        if (xoryField) {
          form.fields.x_dim.info.visible =
            () => {
              return xoryField.getSrvVal() === "X轴"
            }
        }

        let addOptionCondition = function (field) {
          field.info.dispLoader.conditions = field.info.dispLoader.conditions || []
          field.info.dispLoader.conditions.push({
            colName: "chart_no",
            ruleType: "eq",
            value: "data.chart_no"
          })
        }

        form.fields.xaxis_no && addOptionCondition(form.fields.xaxis_no)
        form.fields.yaxis_no && addOptionCondition(form.fields.yaxis_no)
        form.fields.grid_no && addOptionCondition(form.fields.grid_no)
      },


      decorateDimField: function (dimField) {
        if (!dimField) {
          return
        }

        let vm = this;
        dimField.info.editor = "select";
        dimField.optionsFunc = _ => {
          let dims = vm.dims;
          if (dims && dims.length > 0) {
            return dims.map(item => {
              return {value: item, label: item};
            });
          }
        };
      }

    },

    mounted: function () {
      let form = this.$refs.detail.$refs["simple-detail"];
      let previewAction = new ActionInfo()
      let actionName = "preview";
      this.$set(form.actions, actionName, previewAction);
      previewAction.name = actionName
      previewAction.label = "预览"
      previewAction.seq = 1000;

      let vm = this;
      previewAction.invokeFunc = _ => {
        let location = {
          name: 'showstatchart',
          params: {chartid: this.id}
        }
        vm.$router.push(location);
      };
    }

  };
</script>
