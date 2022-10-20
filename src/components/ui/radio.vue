/* */
<template>
  <el-radio-group v-model="field.model" @change="$emit('field-value-changed', field.info.name, field)">
    <el-radio v-for="(option, index) in getOptions" :label="option.value" :key="option.value" :disabled="!field.info.editable">
      {{option.label}}
    </el-radio>
  </el-radio-group>
</template>

<script>
  export default {
    components: {},

    props: {
      field: Object,
    },

    computed: {
      getOptions() {
        return this.field.info.srvCol.option_list_v2.options;
      }
    },
    data() {
      return {}
    },

    methods: {},

    created: function () {
    },

    mounted: function () {
    }
  }
</script>

