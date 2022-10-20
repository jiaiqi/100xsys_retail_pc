<template>
  <div>
    <el-row :gutter="10" v-for="row in rows" :key="row.row_index">
      <el-col v-for="block in row.blocks" :key="row.row_index + block.col_index"
              :span="block.span"
      >
        <custom-page-block :component-type="block.component_type"
                           :input-props="block.props"
                           :data-select-service="block.data_select_service"

        >
        </custom-page-block>

      </el-col>
    </el-row>
  </div>

</template>

<script>
  import CustomPageBlock from "./custom-page-block";

  export default {
    name: "custom-page",
    components: {CustomPageBlock},

    props: {
      pageNo: {
        type: String
      },

    },

    data() {
      return {
        rows: null,
      }
    },

    created: function () {
      let pageNo = this.pageNo || this.$route.params.page_no;

      // load page and page blocks
      let condition = [{
        colName: "page_no",
        ruleType: "eq",
        value: pageNo,
      }]

      this.select("srvsys_custom_page_block_select", condition)
        .then(response => {
          // reconstruct blocks in row/col
          let blocks = response.data.data
          let rowMap = {}

          blocks.forEach(block => {
            if (!rowMap[block.row_index]) {
              rowMap[block.row_index] = {blocks: []}
            }

            let row = rowMap[block.row_index]
            row.blocks.push(block)
          })

          // sort row, col
          this.rows = _.sortBy(Object.values(rowMap), item => item.row_index);
          this.rows.forEach(row => {
            row.blocks = _.sortBy(row.blocks, item => item.col_index)
          })
        })
    }

  }
</script>

<style scoped>
</style>