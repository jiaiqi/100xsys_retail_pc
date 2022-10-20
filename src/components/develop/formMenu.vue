<template>
<div>

<el-tabs type="border-card">
  <el-tab-pane label="创建任务">

    <el-form ref="form" :model="form" label-width="100px" >
    

        <el-form-item label="活动区域" :required="true">
    <el-select v-model="form.region" placeholder="星标组">
      <el-option v-for="(item,index) in judgeArr " :key="index" :label="item.title" :value="index"></el-option>
    </el-select>
         <span class="tip">选择您要发送的分组</span>
  </el-form-item>


<el-form-item :required="true" label="发送内容">
     <div v-for="(item,index) in dataselsect" :key="index">
         <el-input style="width: 850px" placeholder="变量：当前时间{time},当前日期{date},换行符\n" v-model="inputSet[item.col]">
        <template slot="prepend">{{item.label}}</template>
    </el-input>
     </div>
  </el-form-item>

<el-form-item label="发送速度">
    <el-radio-group v-model="form.resource">
      <el-radio label="0">随机速度</el-radio>
      <el-radio label="1">1x</el-radio>
      <el-radio label="3">3x</el-radio>
      <el-radio label="5">5x</el-radio>
      <el-radio label="7">7x</el-radio>
      <el-radio label="9">9x</el-radio>
    </el-radio-group>
  </el-form-item>


  <el-form-item label="链接网址">
    <el-input  style="width: 450px" v-model="form.url" placeholder="消息点击后打开的网址"></el-input>
         <span class="tip">请以http://或https://开头，没有请留空 若地址较长请使用工具缩短后填写</span>

  </el-form-item>
    <el-form-item label="小程序APPID">
    <el-input style="width: 450px"  v-model="form.appid" placeholder="小程序后台基本设置里面"></el-input>
         <span class="tip">小程序appid如wx1b1d...,必须与当前公众号是关联关系，没有请留空</span>

  </el-form-item>
    <el-form-item label="小程序页面">
    <el-input style="width: 450px"  v-model="form.page" placeholder="填写小程序跳转页面"></el-input>
         <span class="tip">小程序页面地址如 pages/index , 没有请留空</span>

  </el-form-item>
  
   <el-form-item label="测试用户" >
     <el-select
        v-model="value"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="请输入关键词"
        :remote-method="remoteMethod"
        :loading="loading">
        <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
        </el-option>
    </el-select>
  </el-form-item>
  

  <el-form-item>
    <el-button type="primary" @click="onSubmit">创建</el-button>
  </el-form-item>
</el-form>
  </el-tab-pane>
 
</el-tabs>


</div>
</template>
<script>
  export default {
    data() {
      return {
        sss:500000,
        form: {
          region: '',
          resource:'0',
          url: '',
          appid:'',
          page:''
        },
        inputSet:{
           
        },
        text:[
            {num:0,title:'按顺序0万-5万'},
            {num:50000,title:'按顺序5万-10万'},
            {num:100000,title:'按顺序10万-15万'},
            {num:150000,title:'按顺序15万-20万'},
            {num:250000,title:'按顺序25万-30万'},
            {num:300000,title:'按顺序30万-35万'},
            {num:350000,title:'按顺序35万-40万'},
        ],
        judgeArr:[],
         dataselsect: [
            {
                "col": "first",
                "label": "头部说明"
            },
            {
                "col": "keyword1",
                "label": "报告内容"
            },
            {
                "col": "keyword2",
                "label": "处理时间"
            },
            {
                "col": "remark",
                "label": "底部说明"
            }
        ],
        snameType:'add',



             options: [],
        value: [],
        list: [],
        loading: false,
        states: ["Alabama", "Alaska", "Arizona",
        "Arkansas", "California", "Colorado",
        "Connecticut", "Delaware", "Florida",
        "Georgia", "Hawaii", "Idaho", "Illinois",
        "Indiana", "Iowa", "Kansas", "Kentucky",
        "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota",
        "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York",
        "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania",
        "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas",
        "Utah", "Vermont", "Virginia",
        "Washington", "West Virginia", "Wisconsin",
        "Wyoming"]
      }
    },
    mounted(){
     this.list = this.states.map(item => {
        return { value: `value:${item}`, label: `label:${item}` };
      });
    },
    methods: {
         remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.options = this.list.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.options = [];
        }
      },
      onSubmit() {
        console.log(this.form,this.inputSet,'submit!');
        let isFinish = true
        Object.keys(this.inputSet).forEach((item)=>{
            if(this.inputSet[item]==''){
                 isFinish = false
            }
        })
        console.log(this.inputSet,this.form.region,isFinish)
        if(isFinish&&this.form.region!==''){
            //  let conditions  = [{
            //     "app_no": this.$route.query.app_no,
            //     "template_no":  this.$route.query.template_no,
            //     "title": this.$route.query.title,
            //     "send_rate":this.form.resource ,
            //     "receive_packet": this.form.region+1,//0-5w 1 5-10w 2
            //     "link_address": this.form.url,
            //     "pro_app_id": this.form.appid,
            //     "pro_pages": this.form.page,
            //     "content": this.inputSet
            // }]
            // let serName = `srvwx_app_template_msg_cfg_${this.snameType}`

            let conditions =   [{
                "serviceName": `srvwx_app_template_msg_cfg_${this.snameType}`,
                "srvApp":'yjz',
                "data": [{
                    "app_no": this.$route.query.app_no,
                    "template_no":  this.$route.query.template_no,
                    "title": this.$route.query.title,
                    "send_rate":this.form.resource ,
                    "receive_packet": this.form.region+1,//0-5w 1 5-10w 2
                    "link_address": this.form.url,
                    "pro_app_id": this.form.appid,
                    "pro_pages": this.form.page,
                    "content": this.inputSet
                }]
            }]

         this.operate(conditions).then(response => {
                 if(response.data.state== "SUCCESS"){
                    this.$message({
                        type: "success",
                        message: "任务创建成功!"
                    });
                 }
          })
        }else{
             this.$message.error('必填项未填写完整！');
        }
        
      },
      judge(a){
          let data = this.text
          data.forEach(item => {
              if(this.sss>=item.num){
                  this.judgeArr.push(item)
               }
          });
          console.log(this.judgeArr,'arrarrarr')
      },
      selsect(){
          let data = {
                "serviceName": "srvwx_app_template_msg_cfg_select",
                "colNames": [
                    "*"
                ],
                "condition": [
                    {
                        "colName": "batch_no",
                        "value": "20201116151817321100",
                        "ruleType": "eq"
                    }
                ]
            }
            this.select(data).then(response => {
                    console.log(response)
            })
      }
    },
    created(){
        this.judge()
        let content = {}
        this.dataselsect.forEach((item)=>{
              content[item.col]=""
        })
        this.inputSet = content
        if(this.$route.query.type){
        this.snameType =this.$route.query.type

        }

        this.selsect()
    }
  }
</script>
<style scoped>
    .tip{
        margin-left: 15px;
        font-size: 13px;
        color: #9a9a9a;
    }
</style>