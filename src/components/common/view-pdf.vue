<template>
  <div>
    <iframe
      src=""
      frameborder="0"
      id="pdf-viewer"
      style="width: 100%; height: calc(100vh - 20px)"
    ></iframe>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dowloadpdfsrc: ''
    }
  },
  methods: {
    loadPdf (url) {
      var paramData = {};
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      // 设置请求头参数，可以添加token值
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8;');
      // 设置响应体返回类型，这里需要把返回的文件流转换成 blob 类型
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        if (this.status == 200) {
          var name = xhr.getResponseHeader('Content-disposition');
          name = decodeURIComponent(name);
          // debugger
          // 返回的文件流，转换成blob对象
          var blob = new Blob([ xhr.response ], { type: xhr.response.type });
          // 转换成blob类型的url
          var blobUrl = URL.createObjectURL(blob);
          document.getElementById('pdf-viewer').src = blobUrl
        }
      };
      xhr.send(JSON.stringify(paramData));
    }
  },
  mounted () {
    if (this.isTopComp() && this.$route && this.$route.query) {
      var pdfsrc = this.$route.query.pdfsrc;
      pdfsrc = decodeURIComponent(pdfsrc);
      this.dowloadpdfsrc = pdfsrc
      this.loadPdf(pdfsrc)
    }
  },
}
</script>

<style lang="scss" scoped>
</style>