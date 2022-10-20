/* */
<template>

  <div>
    <el-select v-model="selected"
               clearable
               multiple
               filterable
               remote
               placeholder="请选择"
               :remote-method="loadOptions"
               :disabled="!field.info.editable"
               @change="onValueChange"
               style="min-width: 100%"
    >
      <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
  export default {
    components: {},
    props: {
      field: Object,
      defaultConditions: Array,
    },
    data() {
      return {
        selected: null,
        options: [],
      }
    },

    methods: {
      onValueChange() {
        
        this.field.model = this.selected
        this.$emit('field-value-changed', this.field.info.name, this.field)
      },

      loadOptions(queryString) {
        let fieldInfo = this.field.info
        let loader = fieldInfo.dispLoader
        if (!loader) {
          return Promise.resolve(false);
        }

        if (loader.enableFunc) {
          if (!loader.enableFunc()) {
            return;
          }
        }

        let dispCol = fieldInfo.dispCol;
        queryString = queryString.trim()
        let queryJson = {
          serviceName: loader.service,
          queryMethod: 'select',
          colNames: ['*'],
          condition: [
            {colName: dispCol, value: queryString, ruleType: 'like'}
          ],
          page: {
            pageNo: 1,
            rownumber: 500,
          },
        }
        return this.selectList(queryJson,loader.srvApp !== '' && loader.srvApp !== null ? loader.srvApp : undefined).then(response => {
          if (response && response.data && response.data.data) {
            this.options = response.data.data.map(item => {
              if(item.user_no === 'admin'){
                console.log(item)
              }
              return {
                value: 'user--'+`${item.user_no}--${item.user_disp}`,
                // value: `${item.user_no}`,
                label: item.user_disp,
              };
            })
          }
        })
      },

      getSrvVal() {
        if (!this.selected) {
          return null
        }
        
        let items = this.selected.map(item => {
          let parts = item.split("--");
          return {
            type: parts[0],
            value: parts[1],
            disp: parts[2],
          }
        })

        return JSON.stringify(items);
      },

      setSrvVal(srvVal) {
        if (srvVal == null || srvVal == undefined) {
          this.selected = null;
          return;
        }
        this.loadOptions("")
          .then(_ => {
            let arr = JSON.parse(srvVal)
            this.selected = arr.map((item) =>{
              return `${item.type}--${item.value}--${item.disp}`
            })
            // this.selected = arr.map(item => `${item.type}`)
          })
      },
    },

    created: function () {
      if (this.field.model) {

        this.setSrvVal(this.field.model)
      }
    }
  }
</script>

<style>

</style>