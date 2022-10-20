<template name="personal_single">
  
  <div name="personal_single">
    <div name="personal_single">
      <h4> &nbsp;个人信息补录</h4>
    </div>
    <simple-update service="srvvx_personal_basic_info_add_update"
                   loaderServiceProp="srvvx_personal_basic_info_update_select"
                   :default-conditions="getCondition()"
    >
    </simple-update>

    <div>
      <h4> &nbsp;家庭成员列表</h4>
    </div>
    <list service="srvvx_personal_family_member_select" :default-condition="getFamilyMemberCondition()" name="srvvx_personal_family_member_select_add_update"></list>

    <div>
      <h4> &nbsp;教育经历列表</h4>
    </div>
    <list service="srvvx_personal_training_select" :default-condition="getTrainingCondition()" name="srvvx_personal_training_select_add_update"></list>

    <div>
      <h4> &nbsp;工作经历列表</h4>
    </div>
    <list service="srvvx_personal_resume_select" :default-condition="getResumeCondition()" name="srvvx_personal_resume_select_add_update"></list>

    <div>
      <h4> &nbsp;证书列表</h4>
    </div>
    <list service="srvvx_personal_credential_select" :default-condition="getCredential()" name="srvvx_personal_credential_select_add_update"></list>

    <div>
      <h4> &nbsp;职称列表</h4>
    </div>
    <list service="srvvx_personal_title_select" :default-condition="getTitle()" name="srvvx_personal_title_select_add_update"></list>

  </div>

</template>

<script>
  import SimpleUpdate from "../components/common/simple-update";
  import List from "../components/common/list";
  import {ActionInfo} from '../components/model/ActionInfo';
  import Vue from 'vue';
  import Action from '../components/common/action';
  import {ExecutorInfo} from '../components/model/ExecutorInfo'
  import momentLib from "moment";

  export default {
    name: "personal-info-update",
    components: {
      List, 
      action: Action,
      SimpleUpdate
    },

    data() {
      return {

        service_name: this.service || this.$route.params.service_name,
        familyNum: 0,
        trainingNum: 0,
        resumeNum: 0,
        num: 0
      }
    },

    created: function(){

      //教育经历时间校验
      this.onEvent("list#srvvx_personal_training_select_add_update/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
        //设置教育经历开始结束时间校验
        form.formValidators.push({
          func: (data, vm) => {
            if (!data.start_time || !data.end_time) {
              return true
            }
            if (data.start_time > data.end_time) {
              return {
                "message": "开始时间必须小于结束时间",
                "cols": ["start_time", "end_time"]
              };
            }else{
              return true
            }
          }
        })
      })

      //工作经历时间校验
      this.onEvent("list#srvvx_personal_resume_select_add_update/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
        //设置开始结束时间校验
        form.formValidators.push({
          func: (data, vm) => {
            if (!data.start_date || !data.end_date) {
              return true
            }
            if (data.start_date > data.end_date) {
              return {
                "message": "开始日期必须小于结束日期",
                "cols": ["start_date", "end_date"]
              };
            }
            let now = new Date();
            let month = parseInt(now.getMonth())+1
            let nowDate = new Date(now.getFullYear() + '-' + month + '-' + now.getDate());
            if (new Date(data.end_date) > nowDate) {
              return {
                "message": "结束日期不能大于当前日期",
                "cols": ["end_date"]
              };
            }else{
              return true
            }
          }
        })
      })

      this.onEvent("simple-update#main", 'metadata-loaded', function (form) {
          var _this = this;
          let condition = [{
            colName: "user_no",
            ruleType: "eq",
            value: top.user.user_no,
          }]
          form.select("srvvx_personal_basic_info_update_select", condition)
            .then(resp => {
              form.fields.proc_state.model = '是';
            })

          // copy button
          let newButton = form.actions["submit"]
          
          newButton.confirm = "部分信息提交后不可修改，请确认是否提交"
          newButton.nav2Location={
            name: 'personalInfo',
            params: {service_name: 'personal'}
          }
          newButton.precheckFunc = () =>{
              var _this = this
                // let validate = form.validateForm();

            let familyList = form.findNodeByPath("list#srvvx_personal_family_member_select_add_update");
            _this.familyNum = familyList.getRows().length;
            let trainingList = form.findNodeByPath("list#srvvx_personal_training_select_add_update");
            _this.trainingNum = trainingList.getRows().length;
            let resumeList = form.findNodeByPath("list#srvvx_personal_resume_select_add_update");
            _this.resumeNum = resumeList.getRows().length;

            if (_this.trainingNum > 0 && _this.familyNum > 0 && _this.resumeNum > 0){
                form.select("srvvx_personal_basic_info_update_select", condition)
                  .then(resp => {
                    form.fields.proc_state.model = '是';
                  })
                newButton.confirm = "部分信息提交后不可修改，请确认是否提交";
                newButton.loading = true;
                // newButton.executor.queryMethod = "update";
                newButton.executor.service = 'srvvx_personal_basic_info_add_update';
                newButton.nav2Location={
                  name: 'personalInfo',
                  params: {service_name: 'personal'}
                }
              }else if(_this.familyNum == 0){
                newButton.confirm = ""
                newButton.loading = false
                // newButton.executor.queryMethod = null
                newButton.executor.service = null
                newButton.nav2Location = null
                return alert("家庭成员不能为空")
              }else if(_this.trainingNum == 0){
                newButton.confirm = ""
                newButton.loading = false
                // newButton.executor.queryMethod = null
                newButton.executor.service = null
                newButton.nav2Location = null
                return alert("教育经历不能为空")
              }else if(_this.resumeNum == 0){
                newButton.confirm = ""
                newButton.loading = false
                // newButton.executor.queryMethod = null
                newButton.executor.service = null
                newButton.nav2Location = null
                return alert("工作经历不能为空")
              }else{
                newButton.confirm = ""
                newButton.loading = false
                // newButton.executor.queryMethod = null
                newButton.executor.service = null
                newButton.nav2Location = null
                return alert("子表信息不完整")
              }
          }
          
        })
    },

    mounted () {
    },

    methods: {

      

      getFamilyMemberCondition(){
        return [
          {
            colName: "user_code",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
      getCondition(){
        return [
          {
            colName: "user_no",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
      getTrainingCondition(){
        return [
          {
            colName: "user_code",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
      getResumeCondition(){
        return [
          {
            colName: "user_code",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
      getCredential(){
        return [
          {
            colName: "user_code",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
      getTitle(){
        return [
          {
            colName: "user_code",
            ruleType: "eq",
            value: top.user.user_no
          }
        ]
      },
    }
  }
</script>

<style scoped>

</style>