<template>
  <div>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="导出信息">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;"></div>
        <el-checkbox-group v-model="checked" @change="handleCheckedOptionsChange">
          <el-checkbox v-for="item in optionsRun" :value="item.column" :label="item.column" :key="item.column">{{item.column +'/' + item.label}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onExport">导出</el-button>
      </el-form-item>
    </el-form>
   
  </div>

</template>

<script>

export default {
  props: {
    type: {
      type: String,
       default: 'export',  // import || export

    },
    service: {
      type: String,
      default: 'true',
    },
    columns:{
        type:Array,
        default(){
            return []
        }
    }
  },
  data() {
    return {
      config: null,
      optionParams: null,
      value:[],
      checked:[],
      selected:[],
      checkAll:true,
      isIndeterminate:true,
      form:null,
    }
  },
  computed:{
      optionsRun:function(){
          let cols = this.columns.filter((item) => item.show === true)
          
          return cols
      },
      optionParamsRun:function(){
          return this.checked.join(",")
      },
  },
  created: function() {
    setTimeout(()=>{
      this.handleCheckAllChange(true)
    },100)
  },
  methods: {
    onExport(){
        this.$emit("on-export-clicked",this.checked)
        // this.onExportClicked(this.optionParams)
    },
    handleCheckedOptionsChange(value,index){
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.optionsRun.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.optionsRun.length;
        //console.log("handleCheckedOptionsChange:",value,index)
    },
    handleCheckAllChange(val){
      let cols = []
      let self = this
      self.selected = []
      self.optionsRun.forEach((item) => {
         cols.push(item.column)  
         self.selected.push(item.column)
        self.checked = val ? cols : [];
        self.isIndeterminate = false;
       // console.log("handleCheckAllChange",val,cols)
      })
    }

  }
};
</script>

<style scoped>
.bx_action {
  margin-left: 3px;
  margin-right: 3px;
}
</style>



