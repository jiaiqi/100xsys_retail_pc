<template>
  <div>

        <list list-type="all" name="all" :service="service_name" > </list>
      
  </div>
</template>

<script>
import list from "./list";

export default {
  components: {
    list
  },
  data() {
    return {
      service_name: this.$route.params.service_name
    };
  },
  methods: {
  }
};
</script>



