
<template>
  <div style="border:1px solid red">
      金额字段值是{{money_model}}
    <button @click="onClick('+')">事件测试+</button>
    <button @click="onClick('-')">事件测试-</button>
  </div>
</template>

<script>
export default {
  name: "list",
  components: {
    editor: () => import(/* webpackChunkName: "ace" */ "vue2-ace-editor")
  },

  props: {
    propsData: {
      type: Object,
      default: null
    },
    formModel: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      num:0,
    };
  },
  computed:{
      money_model:function(){
          let form = this.formModel.form;
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
    let form = this.formModel.form;
    console.log("加载自定义组件", this.serfice);
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

