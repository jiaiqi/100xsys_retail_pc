<template>
<el-row class="filter-list-view" v-if="tabs.length > 0 &&  Object.keys(formModel).length > 0 ">
     <el-form ref="form" label-width="80px" size="mini">
        <el-form-item  :label="tab.label" v-for="(tab,index) in tabs" :key="index">
            <div v-if="tab._type === 'input'">
                <el-row :gutter="5">
                    <el-col :span="6">
                        <el-input col="2" :placeholder="tab.placeholder" clearable :name="tab.list_tab_no" v-model="formModel[tab.list_tab_no].value"></el-input>
                    </el-col>
                    <!-- <el-col :span="6">
                        <el-radio-group :disabled="formModel[tab.list_tab_no].value == ''" v-model="inputMoreConfig.value">
                            <el-radio :label="item.value" name="type" v-for="(item,index) in inputMoreConfig.options" :key="index">
                                {{item.label}}
                            </el-radio>
                        </el-radio-group>
                    </el-col> -->
                </el-row>
            </div>
            <div v-if="tab._type === 'between'">
                <el-col :span="11">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
                </el-col>
                <el-col class="line" :span="2">-</el-col>
                <el-col :span="11">
                    <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
                </el-col>
            </div>
            <div  v-if="tab._type === 'select'">
                <el-select v-model="formModel[tab.list_tab_no]" placeholder="请选择活动区域">
                <el-option label="区域一" value="shanghai"></el-option>
                <el-option label="区域二" value="beijing"></el-option>
                </el-select>
            </div>
            <div  v-if="tab._type === 'checkbox'">
                <el-checkbox-group v-model="formModel[tab.list_tab_no].value" v-if="tab._colSrvData" >
                    <el-checkbox  :label="item.value" :name="item.value" v-for="(item,index) in tab.options" :key="index" @change="onCheckChange($event,item,tab.list_tab_no)">
                        {{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
            <div  v-if="tab._type === 'radio'">
                <el-radio-group v-model="formModel[tab.list_tab_no].value" v-if="tab._colSrvData"  v-show="tab.options && tab.options.length > 0">
                    <el-radio  :label="item.value" name="type" v-for="(item,index) in tab.options" :key="index">
                        {{item.label}}
                    </el-radio>
                </el-radio-group>
            </div>
        </el-form-item>
        
        <!-- <el-form-item>
            <el-button type="primary" @click="buildConditions(formModel)">查询</el-button>
            <el-button>重置</el-button>
        </el-form-item> -->
        </el-form>
    </el-row>
</template>
<script>
import * as DataUtil from "../../util/DataUtil";
export default {
    name:"filter-tabs",
   data() {
    return {
       form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        inputMoreConfig:{
            value:"",
            options:[{
                'label':'匹配开始',
                'value':'like]'
            },{
                'label':'匹配尾部',
                'value':'[like'
            }]
        },
        formModel:{},
        onInputValue:false, // 是否有输入值
    };
  },
  props: {
    tabs: {
      type: Array,
      default: function() {
        return [];
      }
    },
    cols: {
      type: Array,
      default: function() {
        return [];
      }
    },
    srv: {
      type: String,
      default: function() {
        return '';
      }
    }
  },
  computed:{
      tabRun:function(){
          let self = this
          let tabs = self.tabs
          return tabs
      }
  },
  created() {
      let self = this
    //   setTimeout(function(){
    //       self.onBuildFormValues()
    //   },10)
       self.onBuildFormValues()
  },
  mounted() {
      
  },
  methods: {
      onBuildFormValues(){
          let self = this
          let tabs = this.tabs
          let model = {}
          tabs.forEach((item,index) =>{
              let col = {
                  colName:item._colName,
                  value:"",
                  inputType:item.inputType,
                  formType:"",
                  default:item.default
              }
            item.options = self.getTabOptions(item)
            // this.$set(item,'options',self.getTabOptions(item))
            //console.log(item.inputType,item.options)
            col.colName = item._colName
            col.inputType = item.inputType
            col.formType = item._type
            col.tags = item.more_config.tags || []
            if(item.inputType == 'group'){
                col.tags = item.options
            }
              if(item._type === 'checkbox' || item._type === 'radio' ){
                   if(item._type === 'radio' ){
                      col.value = item.default == '' ?  '' : item.default
                  }else{
                      col.value = item.default == '' ?  [] : item.default.split(',')
                  }
                  
                  if(item.showAllTag && col.value.length  == 0){
                      col.value.unshift('_unlimited_')
                  }
                 
                model[item.list_tab_no] = col
              }else if(item._type === 'input'){
                  col.value = item.default
                model[item.list_tab_no] =col
              }
          })
          self.formModel = model
      },
      getTabSrvCol(tab){
          let col = tab._colName
        //   tab._colName = col.split(',')
          let cols = tab._colName
          let srvCols =  this.cols
          for(let key in cols){
              for(let c in srvCols){
                  if(cols[key] ===srvCols[c].columns){
                       return srvCols[c]
                  }
              }
          }
      },
      onChange(e,t){
          //console.log(e)
      },
      getChecked(e,val){
          let checked = false
          let checkedItem = e.join(',')
          if(checkedItem.indexOf('_unlimited_') !== -1 && val === '_unlimited_'){
              return true
          }else{
              return false
          }
      },
      onCheckChange(e,item,tabno){
        //   this.formModel[n].value =
        // 初始不限选项的选中切换
        let self = this

        if(e === true && item.value === '_unlimited_'){
            self.formModel[tabno].value = ['_unlimited_']
        }else if(e === true && item.value !== '_unlimited_'){
            let val = self.formModel[tabno].value
            self.formModel[tabno].value = val.filter((citem,index) =>{
                if(citem !== '_unlimited_'){
                    return citem
                }
            })
            
        }
         // console.log('e',e)
      },
      onReset(){
          this.onBuildFormValues()
      },
      getTabOptions(tab){
          let self = this
          if(tab.hasOwnProperty('_colSrvData')){
              let scol = tab._colSrvData
              let col = tab._colName
              let options = []
              if(tab._type === 'select' || tab._type === 'checkbox' || tab._type === 'radio'){
                  if(tab.inputType === 'Enum' || tab.inputType === 'Dict'){
                       options = []
                       tab['value'] = []
                        for(let c = 0;c<col.length;c++){
                            for(let cs = 0;cs<scol.length;cs++){
                                if(col[c] === scol[cs].columns && scol[cs].col_type === 'Enum'){
                                    options = scol[cs].option_list_v2
                                   if(tab.showAllTag && options !== undefined){
                                        options.unshift({
                                            "label":"不限",
                                            "value":"_unlimited_",
                                        })
                                    }
                                    return options
                                }else if(col[c] === scol[cs].columns && scol[cs].col_type === 'Dict'){
                                    options = scol[cs].option_list_v2
                                   if(tab.showAllTag && options !== undefined){
                                        options.unshift({
                                            "label":"不限",
                                            "value":"_unlimited_",
                                        })
                                    }
                                    return options
                                }
                            }
                        }
                  }else if(tab.inputType === 'BetweenNumber' || tab.inputType === 'Date'  || tab.inputType === 'DateTime'  || tab.inputType === 'String'){
                      tab['value'] = []
                        options = []
                        let opts = tab.more_config.tags
                        for(let cs = 0;cs<opts.length;cs++){
                            let obj = {
                                "label":"",
                                "value":"",
                            }
                            obj.label = opts[cs].tagName
                            obj.value = opts[cs].value
                            obj.ruleType = opts[cs].ruleType
                            obj.checked = opts[cs].default === undefined ? false : opts[cs].default
                            options.push(obj)
                        }
                        if(tab.showAllTag && options !== undefined){
                            options.unshift({
                                "label":"不限",
                                "value":"_unlimited_",
                            })
                        }
                        // tab.options = options
                        // console.log(options)
                        return options
                  }else if(tab.inputType === 'group'){
                      let options = []
                      self.buildGroupTags(tab).then((res) =>{
                          
                      let opts = res
                          for(let cs = 0;cs<opts.length;cs++){
                            let obj = {
                                "label":"",
                                "value":"",
                            }
                            obj.label = opts[cs].tagName
                            obj.value = opts[cs].value
                            obj.ruleType = opts[cs].ruleType
                            obj.checked = opts[cs].default === undefined ? false : opts[cs].default
                            options.push(obj)
                        }
                        
                      })
                      self.$set(tab,'options',options)
                       return options
                      //console.log('self.buildGroupTags(tab)',self.buildGroupTags(tab))
                        
                       
                      
                  }
                //   if(tab.showAllTag && options !== undefined){
                //       options.unshift({
                //         "label":"不限",
                //         "value":"_unlimited_",
                //     })
                //   }
                // // tab.options = options
                // // console.log(options)
                // return options
              }
          }else{
              return []
          }
      },
       buildGroupTags(e){
           let self = this
          let colName = e._colName[0] || ''
          let group = [{
              colName:colName,
              type:"by"
          }]
          
        return new Promise((resolve, reject) => {
              let options = []
          self.select(this.srv, [], null, null, group, null).then((res) =>{
              let resData = res.data.data
                for(let i =0;i<resData.length;i++){
                    let item = resData[i]
                    let opt = {
                            ruleType:"eq",
                            tagName:item[colName],
                            value:item[colName]
                    }
                    if(item[colName]){
                        options.push(opt)
                    }
                    
                }
                 resolve(options)
            })
        })
      },
      buildConditions(e){
          let self = this
          let condsModel = self.formModel
          let reqs = {
                "serviceName": "srvdemo_development_info_select",
                "colNames": [
                    "*"
                ],
                "condition": [],
                "page": {
                    "pageNo": 1,
                    "rownumber": 10
                },
                "order": []
            }
            let relation_Conditions={
                "relation": "AND",
                "data": []
            }
            let tabs = Object.keys(condsModel)
            
            let colData = {}
            let relation = {
                "relation": "OR",
                "data": [
                ]
            }
            for(let i=0;i<tabs.length;i++){
                relation.data = []
                let child_relation = {
                    "relation": "AND",
                    "data": [
                    ]
                }

                colData = {
                    "colName":"",
                    "ruleType":"",
                    "value":""
                }
                if((condsModel[tabs[i]].formType === 'checkbox' || 
                condsModel[tabs[i]].formType === 'radio') && 
                condsModel[tabs[i]].value.length !== 0 && condsModel[tabs[i]].value[0] !== '_unlimited_'){
                    if(condsModel[tabs[i]].inputType === 'BetweenNumber' || condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType === 'DateTime'){
                        relation.relation = 'AND'
                        relation.data = []
                        let values = condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType === 'DateTime' ?  self.formatDateValues(condsModel[tabs[i]].value) : condsModel[tabs[i]].value 
                        for(let v=0;v<values.length;v++){
                            child_relation = {
                                    "relation": "AND",
                                    "data": [
                                    ]
                            }

                            let betval =  values[v].split(",")
                            for(let j=0;j<betval.length;j++){
                                colData = {
                                    "colName":"",
                                    "ruleType":"",
                                    "value":""
                                }
                                if(betval[j] !== '-'){
                                    if(j===0 && betval[j] !== '-'){
                                    colData.colName = condsModel[tabs[i]].colName[0]
                                    colData.value =  condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType === 'DateTime' ? betval[j] :Number(betval[j])
                                    colData.ruleType = betval.length > 1 ? "ge" : "like"  // 只有一个只时候 按照 like 查询
                                    
                                    }else if(betval[j] !== '-'){ 
                                        colData.colName = condsModel[tabs[i]].colName[0]
                                        colData.value = condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType === 'DateTime' ? betval[j] :Number(betval[j])
                                        colData.ruleType = "le"
                                    }
                                    if(values.length > 1){
                                        child_relation.data.push(self.bxDeepClone(colData))
                                    }else{
                                        relation.data.push(self.bxDeepClone(colData))
                                    }
                                }
                            }

                            if(values.length > 1){
                                relation.relation = 'OR'  // 大于1个选项时处理 OR
                                relation.data.push(self.bxDeepClone(child_relation))
                            }
                        }
                    }else if(condsModel[tabs[i]].inputType === 'Enum' || condsModel[tabs[i]].inputType === 'Dict' || condsModel[tabs[i]].inputType === 'group'){
                        relation.relation = 'OR'
                        colData.colName = condsModel[tabs[i]].colName[0]
                        colData.value = (condsModel[tabs[i]].formType == 'radio' ?  condsModel[tabs[i]].value : condsModel[tabs[i]].value.join(","))
                        colData.ruleType = "in"
                        relation.data.push(self.bxDeepClone(colData))
                    }else if(condsModel[tabs[i]].inputType === 'String' ){
                        let tags = condsModel[tabs[i]].tags
                        // let rt = 
                        let val = condsModel[tabs[i]].value
                        for(let j = 0 ;j<val.length ; j++){
                            let rt = tags.filter((item) =>{
                                if(item.value === val[j]){
                                    return item
                                }
                            })
                            relation.relation = 'OR'
                            colData.colName = condsModel[tabs[i]].colName[0]
                            colData.value = val[j]
                            colData.ruleType = rt[0].ruleType
                            relation.data.push(self.bxDeepClone(colData))
                        }
                        // relation.relation = 'OR'
                        // colData.colName = condsModel[tabs[i]].colName[0]
                        // colData.value = condsModel[tabs[i]].value.join(",")
                        // colData.ruleType = "in"
                        
                    }
                    
                }else if(condsModel[tabs[i]].formType === 'input' && condsModel[tabs[i]].value.length !== 0){
                    child_relation = {
                        "relation": "OR",
                        "data": [
                        ]
                    }
                    for(let col = 0;col<condsModel[tabs[i]].colName.length;col++){
                        colData.colName = condsModel[tabs[i]].colName[col]
                        colData.value = condsModel[tabs[i]].value
                        if(self.inputMoreConfig.value !== ''){
                            colData.ruleType = self.inputMoreConfig.value
                        }else{
                            colData.ruleType = "[like]"
                        }
                        relation.data.push(self.bxDeepClone(colData))
                    }
                }
                
               if(relation.data.length !== 0){
                    relation_Conditions.data.push(self.bxDeepClone(relation))
                } 
            }
            
            
            //console.log("tabs",relation_Conditions)
            return relation_Conditions
          
      },
      formatDateValues(e){
          let exps = e
          let typeConfig=['nowDay' ,'nowWeek','nowMonth', 'nowYear']
          let type = null   // nowDay | nowWeek | nowMonth | nowYear
          let increment = 0
          for(let key in typeConfig){
              if(exps.indexOf(typeConfig[key]) !== -1){
                  type = typeConfig[key]
              }
          }
          let startAndEnd =  (exps.indexOf(',') !== -1 ? exps.split(',') : [exps])
          if(startAndEnd[0] == type){
               increment = (startAndEnd.length == 1 ?  0  : startAndEnd[1])
          }else{
              increment = -startAndEnd[0]
          }
         if(type === 'nowWeek'){
              return  DataUtil.getWeekStartAndEnd(increment)
         }else if(type === 'nowDay'){
             return  DataUtil.getDayStartAndEnd(increment)
         }else if(type === 'nowMonth'){
             return  DataUtil.getMonthStartAndEnd(increment)
         }else if(type === 'nowYear'){
             return dataUtil.getYearStartAndEnd(increment)
         }
        
      }
  },
  watch: {
        'formModel': {
          deep: true,
          immediate: true,
          handler: function (val, oldVal) {
              let keys = Object.keys(val)
              let onNew = false
              let newNum = 0
              for(let i =0;i<keys.length;i++){
                  if(val[keys[i]].hasOwnProperty('value') && val[keys[i]].value.length !== 0){
                     newNum++
                  }
              }
              if(keys.length > 0){
                  if(newNum !== 0){
                        this.onInputValue = true
                        this.$emit('on-input-value',true)
                    }else{
                        this.onInputValue = false
                        this.$emit('on-input-value',false)
                    }

                    this.$emit('on-change',true) 
              }
              
          }
        },
    },
}
</script>
<style lang="less" scoped>
.filter-list-view{
    border: 1px solid #f2f2f2;
    padding: 5px;
}
.el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
    margin-bottom: 8px;
}
</style>