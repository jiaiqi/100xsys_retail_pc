
<template>
  <div style="border:1px solid red">
      <el-tree
        :data="data"
        show-checkbox
        node-key="id"
        :default-expanded-keys="[2, 3]"
        :default-checked-keys="[5]"
        :props="defaultProps">
      </el-tree>
  </div>
</template>

<script>
export default {
  name: "authority",
  components: {
  },

  props: {
    propsData: {
      type: Object,
      default: function(){
          return {}
      }
    },
    formModel: {
      type: Object,
      default: function(){
          return {}
      }
    }
  },

  data() {
    return {
      num:0,
      data: [{
        "role_name": "内部角色1",
        "type": "add",
        "role_no": "角色编号",
        "remark": "说明",
        "menus": ["test_menu"],
        "funs": ["001","002"],
        "srvs": [{
          "service": "srvtest_table_select",
          "operate_type": "select"
        }]
      }],
    authFunListdata: [{
      "terminal_type": "PC",
      "del_flag": "否",
      "create_time": "2022-10-25 11:06:02",
      "modify_user_disp": null,
      "modify_user": null,
      "modify_time": "2022-10-25 11:06:02",
      "create_user_disp": "姚金柱/yaojz",
      "is_require_srv": "是",
      "remark": null,
      "is_leaf": "是",
      "relate_srv": "srvtest_table_add",
      "biz_path": null,
      "parent_no": "FUN_202210250001",
      "relate_menu_no": null,
      "path": "/FUN_202210250001/FUN_202210250002/",
      "fun_no": "FUN_202210250003",
      "srv_type": "add",
      "id": 8,
      "create_user": "yaojz",
      "fun_name": "增加"
    },
    {
      "terminal_type": "PC",
      "del_flag": "否",
      "create_time": "2022-10-25 11:05:36",
      "modify_user_disp": null,
      "modify_user": null,
      "modify_time": "2022-10-25 11:05:36",
      "create_user_disp": "姚金柱/yaojz",
      "is_require_srv": "是",
      "remark": null,
      "is_leaf": "是",
      "relate_srv": "srvtest_table_select",
      "biz_path": null,
      "parent_no": "FUN_202210250001",
      "relate_menu_no": null,
      "path": "/FUN_202210250001/FUN_202210250002/",
      "fun_no": "FUN_202210250002",
      "srv_type": "select",
      "id": 7,
      "create_user": "yaojz",
      "fun_name": "查询"
    },
    {
      "terminal_type": "PC",
      "del_flag": "否",
      "create_time": "2022-10-25 11:04:58",
      "modify_user_disp": null,
      "modify_user": null,
      "modify_time": "2022-10-25 11:04:58",
      "create_user_disp": "姚金柱/yaojz",
      "is_require_srv": null,
      "remark": null,
      "is_leaf": "否",
      "relate_srv": null,
      "biz_path": null,
      "parent_no": null,
      "relate_menu_no": null,
      "path": "/FUN_202210250001/",
      "fun_no": "FUN_202210250001",
      "srv_type": null,
      "id": 6,
      "create_user": "yaojz",
      "fun_name": "测试系统内容权限功能"
    }]
    };
  },
  computed:{
      money_model:function(){
          let form = this.formModel ? this.formModel.form : {};
          console.log("formModel",form['formModel'])
          return form.formModel['money_model']
      }
  },
  methods: {
    onClick(e) {
      if(e==='+'){
        this.num++
        }else if(e==='-' && this.num > 0){
        this.num--
        }
      this.$emit("value-change",this.num)
      this.$emit("extend-change", e);
    },
    validata(){
      let valid = this.num > 5 ? true : false
      if(!valid){
          this.$alert('这是一段内容', '标题名称', {
            confirmButtonText: '确定',
            callback: action => {
              this.$message({
                type: 'info',
                message: `action: ${ action }`
              });
              
            }
            
        });
      }
      let message = "校验不通过"
      return {valid,message}
    }
  },
  created: function() {
    // let form = this.formModel ? this.formModel.form :this.formModel;
    // console.log("加载自定义组件", this.serfice);
  },
  mounted: function() {},
  watch: {
    // formModel:{
    //     handler:function(nV,oV){
    //         // console.log("form更新了--",nv)
    //     },
    //     deep:true
    // }
  },

};
</script>

