/* */
<template>
  <div>

    <div style="border-radius: 4px; padding:10px; border:1px solid #dcdfe6; overflow: auto;max-width:210mm;margin:0 auto;"
         v-html="html"></div>
  </div>
</template>

<script>


  export default {
    "name":"richView",
    data(){
        return {
            html:""
        }
    },
    props: {
    //   html: {
    //     type: String,
    //     default: "",
    //   },


    },

    methods: {},


    created: function () {
        this.html = this.$route.query.data
    },


    mounted: function () {
    }
  }
  ;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .el-table th {
    text-align: center;
  }

  .el-table tbody tr td:first-child {
    text-align: center;
  }
</style>
