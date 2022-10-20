<template>
    <div style="margin:0;padding:0" class="table-form-item">
        <span  style="color:#333" v-if="(noEditCols.indexOf(field.columns) !=-1 && !rowData.parent_no) || isDetail == 'detail' ">{{rowData[field.columns]}}</span>
        <!-- <div  style="{margin:0,padding:0}" v-if="(isDetail == 'add' || isDetail== 'update')  && ((noEditCols.indexOf(field.columns) ==-1 && dataType == 'initData') || (dataType != 'initData'))"> -->
        <div  style="{margin:0,padding:0}" v-if="(!rowData.parent_no && noEditCols.indexOf(field.columns) ==-1 && !(isDetail =='detail')) ||( rowData.parent_no && !(isDetail =='detail'))">
            <el-input v-model="rowValueData"  :type="field.frontCompType" size="mini" style="margin:0;" @input="inputChange($event)"></el-input>
        </div>
  <!-- <el-form-item label="活动区域">
    <el-select v-model="form.region" placeholder="请选择活动区域">
      <el-option label="区域一" value="shanghai"></el-option>
      <el-option label="区域二" value="beijing"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="活动时间">
    <el-col :span="11">
      <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
    </el-col>
    <el-col class="line" :span="2">-</el-col>
    <el-col :span="11">
      <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
    </el-col>
  </el-form-item> -->
    </div>
</template>
<script>
export default {
    name: "tableRowItem",
    components: {
    },
    props:{
        "field":{
            type:Object,
            default(){
                return {}
            }
        },
        "initValue":{
            default(){
                return ''
            }
        },
        "noEditCols":{
            type:Array,
            default(){
                return []
            }
        },
        "dataType":{
            type:String,
            default(){
                return 'initData'
            }
        },
        "rowData":{
            type:Object,
            default(){
                return {}
            }
        },
        isDetail:{
            type:String,
            default:'detail',
        }
    },
    computed:{
        fieldRun(){
            let fieldList = this.field ? this.field :[]
            
            for(let key in this.field){
                this.$set(this.fieldModel,key,field.key)
            }
            this.fieldModel.value = this.initValue
            return fieldList
        },
        isUpdated(){
            let req = false
            if(this.field && this.field.updated &&  this.noEditCols.indexOf(this.field.columns) != -1){
                req = true
            }
            return req
        }
    },
    mixins: [],
    created(){
        this.setInitValue()
        
    },
    data() {
        return{
            fieldModel:{
                value:null,
                initValue:null,
                frontPlayValue:"",
                formModelValue:null,
                validate:null,
                validateFun:null,
            },
            rowValueData:null
        }
    },
    methods:{
        getColsEdit(e){
            let isEdit = false
            if(e.updated){
                isEdit = true
            }
            return isEdit
        },
        inputChange(e){
            let self = this
            console.log("inputChange",e)
            self.$emit("valueChange",e)
        },
        setInitValue(){
            if(this.initValue !== 0 && this.initValue){
                this.fieldModel.initValue = this.initValue
                this.fieldModel.value = this.initValue
            }
            this.rowValueData = this.rowData[this.field.columns]
        }
    }
}
</script>
<style scoped lang="less">
::v-deep input::-webkit-outer-spin-button,
            ::v-deep input::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            }
            ::v-deep input[type='number'] {
            -moz-appearance: textfield !important;
            }
 .table-form-item{
     display: inline;
     margin: 0;
     min-height: 30px;
     >.el-form-item{
         margin: 0;
        .el-form-item__content{
            margin: 0;
            margin-left: 0!important;
            

            
            .el-input{
                width: 100%;
                margin: 0;
                input{
                    margin: 0 0!important;
                }
                
 
                .el-input__inner{
                    padding: 0!important;
                }
            }
        }
    }
 }   



</style>