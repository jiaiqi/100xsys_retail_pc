<template>
  <edit-grid>

  </edit-grid>
</template>

<script>

  import TreeFinder from "../ui/tree-finder";
  import ChildList from "../common/child-list";
  import EditGrid from "../common/edit-grid";

  export default {
    components: {
      EditGrid,
      ChildList,
      TreeFinder

    },
    data() {
      return {
        field: null,
        foreingKey: {},
      }
    },

    computed: {},

    created: function () {
      window.form = this;


    },

    mounted: function () {

    },

    methods: {}
  };
</script>