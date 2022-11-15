<template>
    <el-select v-if="formModelData" filterable remote :loading="loading" v-model="formModelData.value" clearable :placeholder="placeholder"  
        :remote-method="buildFkOptionList" @clear="buildFkOptionList('',tab)" @visible-change="visibleChange">
        <!-- @blur="buildFkOptionList(null,tab)" @blur="buildFkOptionList" -->
            <el-option
            v-for="(item,index) in formModelData.options"
            :key="index"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
</template>

<script>
export default {
    name:"select-plus",
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
        
          loading:false,
        onInputValue:false, // 是否有输入值
        formModelData:{},
        initOptions:[], // 初次查询
        optionsLoaded:false,
    }
   },
   mounted(){
       this.formModelData = this.formModel
       this.buildFkOptionList('')
   },
   props:{
       tab:{
           type:Object,
           default:()=>{
               return {}
           }
       },
       formModel:{
           type:Object,
           default:()=>{
               return {}
           }
       },
       placeholder:{
         type:String,
         default:""
       }
   },
   methods:{
      visibleChange(e){
          console.log('visibleChange',e)
          if(!e && this.optionsLoaded){
             this.buildFkOptionList('')
          }
      },
       buildFkOptionList(query){
           let self = this
           let e = self.tab
          console.log('buildFkOptionList',query,e,self.formModel[e.list_tab_no])
          let conds = []
          this.tab.option_list.conditions = []
          // if(this.tab.hasOwnProperty("option_list") && this.tab.option_list.hasOwnProperty("conditions") && this.tab.option_list.conditions){
          //   conds = this.tab.option_list.conditions
          // }
           self.loading = true
        if (query !== '' && query !== undefined  && query !== null) {
          let cond= {"colName": e.option_list.key_disp_col,
            "ruleType": "[like]",
            "value": query}
          conds.push(cond)
        } else {
          conds = [];
        }
         let c = this.tab.option_list.conditions.concat(conds)
          let options = []
        //   url, service_name, condition, page, order, group, mapcondition,isproc,columns,relationCondition,draft,pageType
          self.select(e.option_list.serviceName, c, null, null, null, null,null, null, null, null,false).then((res) =>{
              let resData = res.data.data
              let labels = []
              let values = []
                for(let i =0;i<resData.length;i++){
                    let item = resData[i]
                    if(labels.indexOf(item[e.option_list.refed_col]) == -1 && values.indexOf(item[e.option_list.key_disp_col]) == -1){
                          labels.push(item[e.option_list.refed_col])
                          values.push(item[e.option_list.key_disp_col])
                         
                    }

                    let opt = {
                            value:item[e.option_list.refed_col],
                            label:item[e.option_list.key_disp_col]
                         }
                       options.push(opt)
                    
                    
                }

                // self.formModel[e.list_tab_no]['options'] = options
                // e.options = options
                // self.$set(self.formModel[e.list_tab_no],"options",options)
                console.log("options",options)
                self.formModelData.options = options
                // if(options)
                if(!self.optionsLoaded){
                  self.initOptions = self.bxDeepClone(options)
                  this.optionsLoaded = true
                }
                if(query && options.length == 0){
                  self.formModelData.options =  self.bxDeepClone(self.options).map((item) => {return item})
                }else if(query && options.length > 0){
                  self.formModelData.options = options.map((item) => {return item})
                }else{
                  // if(self.initOptions.length > 0){
                  //     self.formModelData.options = self.initOptions.map((item) => {return item})
                  // }
                }
                self.loading = false
                //  resolve(options)
            })
            // self.$set(self.formModel[e.list_tab_no],"options",options)
        // return new Promise((resolve, reject) => {
        //       let options = []
        //   self.select(e.buildoptions.serviceName, [], null, null, null, null).then((res) =>{
        //       let resData = res.data.data
        //         for(let i =0;i<resData.length;i++){
        //             let item = resData[i]
        //             let opt = {
        //                     value:item[e.buildoptions.refed_col],
        //                     label:item[e.buildoptions.key_disp_col]
        //             }
        //              options.push(opt)
                    
        //         }

        //         self.formModel[e.list_tab_no]['options'] = options
        //         //  this.$set(e,"options",options)
        //          resolve(options)
        //     })
        // })
      }
   },
   watch: {
        'formModelData': {
          deep: true,
          immediate: true,
          handler: function (val, oldVal) {
            
              if(!val.value){
                // this.buildFkOptionList(val.value)
              }
              if(val.hasOwnProperty('value') && oldVal.hasOwnProperty('value') && val.value !== oldVal.value){
                        this.$emit('on-value-change',{value:val.value,listNo:tab.list_tab_no})
              }else if(val.hasOwnProperty('value') && !oldVal.hasOwnProperty('value') && val.value !== oldVal.value){
                    this.$emit('on-value-change',{value:val.value,listNo:this.tab.list_tab_no})
              }
              
          }
        },
    },
} 
</script>