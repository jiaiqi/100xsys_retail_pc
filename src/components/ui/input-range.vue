/* */
<template>
<div class="el-date-editor el-range-editor el-input__inner el-date-editor--daterange">
    <input v-if="field.model" v-model="field.model[0]"
           autocomplete="off" placeholder="开始"
           class="el-range-input"
           @change="$emit('field-value-changed', field.info.name, field)"
    />
    <span class="el-range-separator">至</span>
    <input v-if="field.model"  v-model="field.model[1]"
           autocomplete="off" placeholder="结束"
           class="el-range-input"
           @change="$emit('field-value-changed', field.info.name, field)"
    />
</div>       
</template>

<script>
import { FieldInfo } from '../model/FieldInfo'
import { Field } from '../model/Field'

export default {
  props: ['field'],
  data() {
    return {
      key: null
    }
  },
  created: function() {
    if (this.field) {
      if (!this.field.model) {
        this.field.model = []
      }
    }
  }
}
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
