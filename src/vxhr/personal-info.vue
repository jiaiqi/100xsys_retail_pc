<template>
  
  <div>
    <div>
      <h4> &nbsp;个人信息详情</h4>
    </div>
    <simple-detail service="srvvx_personal_basic_info_update_select"
                   :default-conditions="getCondition()"
    >

    </simple-detail>

    <div>
      <h4> &nbsp;家庭成员列表</h4>
    </div>
    <list service="srvvx_personal_family_member_select" :default-condition="getFamilyMemberCondition()" name="srvvx_personal_family_member_select"></list>

    <div>
      <h4> &nbsp;教育经历列表</h4>
    </div>
    <list service="srvvx_personal_training_select" :default-condition="getTrainingCondition()" name="srvvx_personal_training_select"></list>

    <div>
      <h4> &nbsp;工作经历列表</h4>
    </div>
    <list service="srvvx_personal_resume_select" :default-condition="getResumeCondition()" name="srvvx_personal_resume_select"></list>

    <div>
      <h4> &nbsp;证书列表</h4>
    </div>
    <list service="srvvx_personal_credential_select" :default-condition="getCredential()" name="srvvx_personal_credential_select"></list>

    <div>
      <h4> &nbsp;职称列表</h4>
    </div>
    <list service="srvvx_personal_title_select" :default-condition="getTitle()" name="srvvx_personal_title_select"></list>

  </div>

</template>

<script>
  import SimpleDetail from "../components/common/simple-detail";
  import List from "../components/common/list";
  import momentLib from "moment";

  export default {
    name: "personal-info",
    components: {List, SimpleDetail},
    
    data() {
      return {

        service_name: this.service || this.$route.params.service_name,
      }
    },

    created: function(){

      //是否有人员信息校验
     
      this.onEvent("simple-detail#main", 'metadata-loaded', function (form) {
        let condition = [{
          colName: "user_no",
          ruleType: "eq",
          value: top.user.user_no,
        }]
        form.select("srvvx_personal_basic_info_update_select", condition)
          .then(resp => {
            //if(0 == resp.body.data.length){
            //  alert("请先添加人员信息");
            //  // window.location.href="/index.html#/list/srvvx_personal_basic_info_select";
            //  window.location.href= window.location.href.replace("#/vxhr/personal-info", "index.html#/list/srvvx_personal_basic_info_select");
            //}else{
            //  return ;
            //}
          })
        })

      //工作经历时间校验
      this.onEvent("list#srvvx_personal_resume_select/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
        //设置执行人开始结束时间校验
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
                "cols": ["start_date", "end_date"]
              };
            }else{
              return true
            }
          }
        })
      })

      //教育经历时间校验
      this.onEvent("list#srvvx_personal_training_select/add#list-add/simple-add#main", 'metadata-loaded', function (form) {
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

      this.onEvent("simple-detail#main", 'metadata-loaded', function (form) {
         

          // add a grid button
          let newButton = form.actions["custom-补录个人信息"]
          newButton.invokeFunc  =  () => {
            window.location.href = window.location.href.replace("/vxhr/personal-info", "/vxhr/personal-info-update");
            // window.frames.location.href = '/vpage#/vxhr/personal-info-update';
          }
          let newUpdateButton = form.actions["custom-修改个人信息"]
          newUpdateButton.invokeFunc = () =>{
            // window.frames.location.href = '/vpage#/vxhr/personal-update';
            window.location.href = window.location.href.replace("/vxhr/personal-info", "/vxhr/personal-update");
          }
        })
      this.onEvent("list#srvvx_personal_family_member_select", 'metadata-loaded', function (familyList) {
          

          let hideButton = ['查询','刷新','添加','删除','收缩表单']
          familyList.gridButton.filter(button => hideButton.includes(button.button_name))
          .forEach(button => button.permission = false)

          let hideRowButton = ['复制','编辑','删除','详情']
          familyList.rowButton.filter(button => hideRowButton.includes(button.button_name))
          .forEach(button => button.permission = false)
      })

      this.onEvent("list#srvvx_personal_training_select", 'metadata-loaded', function (trainingList) {
         

          let hideButton = ['查询','刷新','添加','删除','收缩表单']
          trainingList.gridButton.filter(button => hideButton.includes(button.button_name))
          .forEach(button => button.permission = false)
          
          let hideRowButton = ['复制','编辑','删除','详情']
          trainingList.rowButton.filter(button => hideRowButton.includes(button.button_name))
          .forEach(button => button.permission = false)
      })

      this.onEvent("list#srvvx_personal_resume_select", 'metadata-loaded', function (resumeList) {
         

          let hideButton = ['查询','刷新','添加','删除','收缩表单']
          resumeList.gridButton.filter(button => hideButton.includes(button.button_name))
          .forEach(button => button.permission = false)
          
          let hideRowButton = ['复制','编辑','删除','详情']
          resumeList.rowButton.filter(button => hideRowButton.includes(button.button_name))
          .forEach(button => button.permission = false)
      })

      this.onEvent("list#srvvx_personal_credential_select", 'metadata-loaded', function (credentialList) {
         

          let hideButton = ['查询','刷新','添加','删除','收缩表单']
          credentialList.gridButton.filter(button => hideButton.includes(button.button_name))
          .forEach(button => button.permission = false)
          
          let hideRowButton = ['复制','编辑','删除','详情']
          credentialList.rowButton.filter(button => hideRowButton.includes(button.button_name))
          .forEach(button => button.permission = false)
      })

      this.onEvent("list#srvvx_personal_title_select", 'metadata-loaded', function (titleList) {
          

          let hideButton = ['查询','刷新','添加','删除','收缩表单']
          titleList.gridButton.filter(button => hideButton.includes(button.button_name))
          .forEach(button => button.permission = false)
          
          let hideRowButton = ['复制','编辑','删除','详情']
          titleList.rowButton.filter(button => hideRowButton.includes(button.button_name))
          .forEach(button => button.permission = false)
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