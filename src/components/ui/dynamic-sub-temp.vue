/* */
<template>
   <div style="color:red" @extend-change="extendChange($event)">
         <!-- 子组件点击次数{{num}},当前字段值：{{field.model}}
         <el-input v-model="field.model"></el-input> -->
      <keep-alive>
       <component 
       v-if="isShow && bxComp !== null && bxComp !== ''"  
       v-bind:is="bxComp" 
       :service="service" 
       @value-change="valueChange($event)"  
       @extend-change="extendChange($event)" 
       :ref="'_dev' + tempName" 
       :colValue="field.model"
       :formModel="formModel">a</component>
       </keep-alive>
   </div>
</template>

<script>
import VueEvent from '../../util/VueEvent.js';
  export default {
    props: {
      field: Object,
      config:{
          type:Object,
          default(){
              return null
          }
      },
      form:{
          type:Object,
          default(){
              return null
          }
      },
    },
    computed:{
        tempTypePath:function(){
          let self = this
            if(self.colConfig.type === 'dev'){
                return self.devPath
            }
        },
        formModel:function(){
          let obj = {}
          obj["form"] = this.form
          return obj
        },
        colConfig:function(){
          return this.config  ? this.config.extendConfig : null
        },
        isShow:function(){
          return this.config && this.config.extendConfig
        }
    },
    data() {
      return {
        bxComp:"",
        pubPath: "@/common/",
        devPath: "@/develop/",
        tempName:null,
        service:'', // srvsys_buttons_public_select
        num:0,
        validFun:"",  // 配置的校验方法名
        isValidFun:false,
        rule:{
          isValidFun:"",
          message:"【" + this.field.info.label + "】未进行正确输入",
        },
        funNum:0

      }
    },

    watch: {
    },
    beforeMount() {
        
    },
    methods: {
      extendChange(e){
          console.log(e)
          if(e==='+'){
            this.num++
          }else if(e==='-' && this.num > 0){
            this.num--
          }
          
      },
      valueChange(e){
         this.field.model = e
      },
      subValidatorsFun(){
          let self = this
          
          if(self.validFun && self.tempName){
            
          this.funNum++
            let refName = '_dev'+ self.tempName
            // console.log("subValidatorsFun 子组件校验结果1",this.funNum +'次')
            let valid = self.$refs[refName][self.validFun]
            // console.log(valid)
            let validMsg = valid()
            console.log("subValidatorsFun 校验结果",validMsg)
            let rules = self.field.info.rules
            rules.forEach((item) =>{
              if(item.hasOwnProperty("isValidFun")){
                item.valid = validMsg.valid
                item.message = validMsg.message
              }
            })
          }
          
      },
       improtTemp(){
           let self = this
           let config = self.colConfig
           let pubPath = "../common/"
           let devPath = "../develop/"
          
           if(config && config.hasOwnProperty("verify") && config.verify !== true && config.verify !== false){
             this.validFun = config.verify
             this.rule.isValidFun = config.verify
             this.rule['name'] = '_dev' + config.name
             let rules = []
             if(!this.field.info.rules){
               rules.push(this.rule)
               this.field.info.rules = rules
             }else{
               this.field.info.rules.forEach((item) => {
                 if(!item.hasOwnProperty("isValidFun")){
                    this.field.info.rules.push(this.rule)
                 }
               })
               
             }
           }
           if(config){
              this.tempName = config.name
               switch (config.type) {
                   case "dev":
                       if(config.name){
                         self.service = self.colConfig.service
                         self.$set(self.$data,'service',self.colConfig.service) 
                          this.bxComp = (res) => require(['../develop/'+ config.name+'.vue'], res)
                          // let url = '@/develop/'+ config.name+'.vue'
                          // this.bxComp = import(url)
                        // console.log('---',this.bxComp)
                       }
                       break;
                   default:
                       break;
               }
               
           }
       }
    },

    created: function () {

    },

    mounted: function () {
      
        
        this.improtTemp()
        let self = this
       VueEvent.$on('to-verify',function(data){
            console.log("mounted VueEvent===>",data);
            if(data){
              self.subValidatorsFun()
            }
        })
    }
  }
</script>

