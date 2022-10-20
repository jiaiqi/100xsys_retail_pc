<template>
  
  <div>
    <div>
      <h4> &nbsp;个人信息修改</h4>
    </div>
    <simple-update service="srvvx_personal_basic_info_update_update"
                   :default-conditions="getCondition()"
    >
    </simple-update>

    <div>
      <h4> &nbsp;家庭成员列表</h4>
    </div>
    <list service="srvvx_personal_family_member_select" :default-condition="getFamilyMemberCondition()" name="srvvx_personal_family_member_select_update_update"></list>

    <div>
      <h4> &nbsp;教育经历列表</h4>
    </div>
    <list service="srvvx_personal_training_select" :default-condition="getTrainingCondition()" name="srvvx_personal_training_select_update_update"></list>

    <div>
      <h4> &nbsp;工作经历列表</h4>
    </div>
    <list service="srvvx_personal_resume_select" :default-condition="getResumeCondition()" name="srvvx_personal_resume_select_update_update"></list>

    <div>
      <h4> &nbsp;证书列表</h4>
    </div>
    <list service="srvvx_personal_credential_select" :default-condition="getCredential()" name="srvvx_personal_credential_select_update_update"></list>

    <div>
      <h4> &nbsp;职称列表</h4>
    </div>
    <list service="srvvx_personal_title_select" :default-condition="getTitle()" name="srvvx_personal_title_select_update_update"></list>

  </div>

</template>

<script>
  import SimpleUpdate from "../components/common/simple-update";
  import List from "../components/common/list";
  import momentLib from "moment";

  export default {
    name: "personal-update",
    components: {List, SimpleUpdate},
    data() {
      return {

        service_name: this.service || this.$route.params.service_name,
      }
    },
    created: function(){

      //教育经历时间校验
      this.onEvent("list#srvvx_personal_training_select_update_update/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
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

      //工作经历日期校验
      this.onEvent("list#srvvx_personal_resume_select_update_update/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
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
          

          // add a grid button
          let newButton = form.actions["submit"]
          newButton.invokeFunc  =  () => {
            window.location.href = window.location.href.replace("/vxhr/personal-update", "/vxhr/personal-info");
          }
          newButton.nav2Location={
            name: 'personalInfo',
            params: {service_name: 'personal'}
          }
        })
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