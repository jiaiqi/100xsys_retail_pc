<template>
  <img :src="imgUrl" alt="qrcode not available"/>
</template>

<script>
  export default {
    name: "barcode",

    props: {

      field: {
        type: Object
      },

      codeType: {
        type: String,
        default: "qrcode"
      }
    },

    computed: {
      imgUrl: function () {
        let addr = this.serviceApi().qrcode
        let content = encodeURIComponent(this.field.getSrvVal())
        return `${addr}?content=${content}`;

      }
    }
  }
</script>

<style scoped>

</style>
