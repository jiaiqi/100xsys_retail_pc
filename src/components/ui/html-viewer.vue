/* */
<template>
  <div>

    <div style="border-radius: 4px; border:1px solid #dcdfe6; overflow: auto"
         v-html="html"></div>
  </div>
</template>

<script>


  export default {
    props: {
      html: {
        type: String,
        default: "",
      },


    },

    methods: {},


    created: function () {
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
