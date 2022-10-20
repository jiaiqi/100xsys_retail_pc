/* */
<template>
  <el-checkbox-group v-model="selected" @change="$emit('field-value-changed', field.info.name, field)">
    <el-checkbox v-for="(option, index) in getOptions" :label="option.value" :key="option.value" :disabled="!field.info.editable">
      {{option.label}}
    </el-checkbox>
  </el-checkbox-group>
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
      return {
        selected: [],
      }
    },

    watch: {
      selected() {
        this.field.model = (this.selected || []).join(",");
      }
    },

    methods: {
      setSrvVal(srvVal) {
        this.field.model = srvVal;
        !!srvVal && (this.selected = [...srvVal.split(",")]);
      }

    },

    created: function () {
    },

    mounted: function () {
    }
  }
</script>

