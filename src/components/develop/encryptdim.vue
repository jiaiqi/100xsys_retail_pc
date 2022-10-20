
<template>
  <div v-if="formType=='update'">
  
    <el-row>
      <el-col :span="4">
        <el-select  style="width:100%" filterable remote :remote-method="queryDim" v-model="dimNo" placeholder="请申请查看维度">
          <el-option v-for="item in dimOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-select v-model="dimValues" style="width:100%"  @change="setDimValue" filterable remote multiple :remote-method="queryDimSource" placeholder="请选择查看数据">
          <el-option v-for="item in dimOptionsValue" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
    </el-row>

  </div>

    <div v-else-if="formType=='procdetail'||formType=='detail'">
  
    <el-row>
      <el-col :span="4">
        <el-select disabled style="width:100%" filterable remote :remote-method="queryDim" v-model="dimNo" placeholder="请申请查看维度">
          <el-option v-for="item in dimOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-select  disabled v-model="dimValues" style="width:100%"  @change="setDimValue" filterable remote multiple :remote-method="queryDimSource" placeholder="请选择查看数据">
          <el-option v-for="item in dimOptionsValue" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
    </el-row>

  </div>
  <div v-else>
      <el-row>
      <el-col :span="4">
        <el-select  style="width:100%" filterable remote :remote-method="queryDim" v-model="dimNo" placeholder="请申请查看维度">
          <el-option v-for="item in dimOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-select   v-model="dimValues" style="width:100%"  @change="setDimValue" filterable remote multiple :remote-method="queryDimSource" placeholder="请选择查看数据">
          <el-option v-for="item in dimOptionsValue" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
    </el-row>

  </div>
  </div>
</template>

<script>
export default {
  name: "encryptdim",
  components: {
    editor: () => import(/* webpackChunkName: "ace" */ "vue2-ace-editor")
  },
  props: {
    propsData: {
      type: Object,
      default: null
    },
    formModel: {
      type: Object,
      default: null
    }
  },
  computed: {
    table_name: function() {
      let form = this.formModel.form;
      return form.srvValFormModel().table_name;
    }
  },
  data() {
    return {
      formType:this.formModel.form.formType,
      dimOptions: [],
      dimNo: null,
      dimOptionsValue: [],
      dimValues: []
    };
  },
  methods: {
    setDimValue(data) {
      var data = {"dim_no":this.dimNo,"dim_values":this.dimValues};
      this.$emit("value-change",JSON.stringify(data));
    },
    queryDim(query) {
      var me = this;
      var condition = [];
      condition.push({
        colName: "table_name",
        ruleType: "eq",
        value: me.table_name
      });
      condition.push({ colName: "dim_name", ruleType: "like", value: query });
      var queryJson = {};

      this.select("srvsys_encrypt_col_dim_select", condition).then(response => {
        var dataResult = response.body.data;
        me.dimOptions = [];
        for (var itemMap of dataResult) {
          me.dimOptions.push({
            value: itemMap.dim_no,
            label: itemMap.dim_name
          });
        }
      });
    },
    queryDimSource(query) {
      var me = this;
      var condition = [];
      condition.push({ colName: "dim_no", ruleType: "eq", value: this.dimNo });
      condition.push({ colName: "label", ruleType: "like", value: query });
      var queryJson = {};

      this.select(
        "srvsys_encrypt_col_dim_source_select",
        condition
      ).then(response => {
        var dataResult = response.body.data;
        me.dimOptionsValue = dataResult;
      });
    }
  },
  created: function() {
    let form = this.formModel.form;

if(form.formType=='update'||form.formType=="procdetail"||form.formType=="detail"){
  var data = form.srvValFormModel();
  var apply_data = data.apply_data;
  this.dimNo=JSON.parse(apply_data).dim_no;
  this.dimValues=JSON.parse(apply_data).dim_values;
}
   

  },
  watch: {
    table_name: {
      handler: function(nV, oV) {
        var me = this;
        if (nV) {
          var condition = [];
          condition.push({ colName: "table_name", ruleType: "eq", value: nV });
          var queryJson = {};

          this.select(
            "srvsys_encrypt_col_dim_select",
            condition
          ).then(response => {
            var dataResult = response.body.data;
            me.dimOptions = [];
            for (var itemMap of dataResult) {
              me.dimOptions.push({
                value: itemMap.dim_no,
                label: itemMap.dim_name
              });
            }
          });
        } else {
          me.dimOptions = [];
          me.dimNo = "";
        }
      },
      deep: true
    },

    dimNo: {
      handler: function(nV, oV) {
        var me = this;
        if (nV) {
          var condition = [];
          condition.push({ colName: "dim_no", ruleType: "eq", value: nV });
          var queryJson = {};

          this.select(
            "srvsys_encrypt_col_dim_source_select",
            condition
          ).then(response => {
            var dataResult = response.body.data;
            me.dimOptionsValue = dataResult;
          });
        } else {
          me.dimOptionsValue = [];
          me.dimValues = [];
        }
      },
      deep: true
    }
  }
};
</script>

