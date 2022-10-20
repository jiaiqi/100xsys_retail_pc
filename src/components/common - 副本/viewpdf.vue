<template>
  <div class="pdf" v-show="fileType === 'pdf'">
    <div class="arrow">
      <div>
        <!-- <el-button type="info" icon="el-icon-message" circle></el-button> -->
        <i class="el-icon-d-arrow-left" size="20" @click="changePdfPage(0)"></i>

        <span>{{ currentPage }} / {{ pageCount }}</span>
        <i
          class="el-icon-d-arrow-right"
          size="20"
          @click="changePdfPage(1)"
        ></i>

        <!-- <el-button type="info" icon="el-icon-rank no-print" circle></el-button>
    <el-button type="info" icon="el-icon-circle-plus-outline no-print" circle></el-button>
    <el-button type="info" icon="el-icon-remove-outline no-print" circle></el-button>
    <el-button type="info" icon="el-icon-download no-print" circle></el-button> -->
      </div>
      <div style="float: right">
        <i class="el-icon-rank no-print" @click="fullScreen()"></i>
        <i class="el-icon-circle-plus-outline no-print" @click="big_view()"></i>
        <i class="el-icon-remove-outline no-print" @click="smal_view()"></i>
        <i class="el-icon-download no-print" @click="download()"></i>
      </div>
      <!--<i class="el-icon-printer no-print" @click="pdf_print()"></i> -->
    </div>

    <pdf
      :src="src"
      ref="myPdfComponent"
      :page="currentPage"
      @num-pages="pageCount = $event"
      @page-loaded="currentPage = $event"
      @loaded="loadPdfHandler"
      v-bind:style="{
        width: pdf_width + '%',
        left: left_width + '%',
        top: '40px',
      }"
    >
    </pdf>

  </div>
</template>


<script>

import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'
import pdf from 'vue-pdf'
export default {
  components: {
    pdf
  },

  data () {
    return {
      currentPage: 0, // pdf文件页码
      pageCount: 0, // pdf文件总页数
      fileType: "pdf", // 文件类型
      src: "", // pdf文件地址
      pdf_width: 100,
      left_width: 0,
      dowloadpdfsrc: ""
    };
  },

  computed: {},

  methods: {
    fullScreen () {
      var el = document.documentElement;
      var rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
      }
      return;
    },
    big_view () {
      this.pdf_width = this.pdf_width + 10;
      if (this.pdf_width > 100) {
        this.left_width = 0;
      } else if (this.pdf_width > 0 && this.pdf_width < 100) {
        this.left_width = (100 - this.pdf_width) / 2;
      }
    },
    smal_view () {
      if (this.pdf_width > 10) {
        this.pdf_width = this.pdf_width - 10;
        if (this.pdf_width >= 100) {
          this.left_width = 0;
        } else if (this.pdf_width > 0 && this.pdf_width < 100) {
          this.left_width = (100 - this.pdf_width) / 2;
        }
      }
    },
    download () {
      window.location.href = this.$route.query.pdfsrc;
    },
    pdf_print () {

      this.$refs.myPdfComponent.print();
    },
    // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页
    changePdfPage (val) {

      if (val === 0 && this.currentPage > 1) {
        this.currentPage--;

      }
      if (val === 1 && this.currentPage < this.pageCount) {
        this.currentPage++;

      }
    },
    // pdf加载时
    loadPdfHandler (e) {
      this.currentPage = 1; // 加载的时候先加载第一页
    }
  },
  created: function () {
    if (this.isTopComp() && this.$route && this.$route.query) {
      var pdfsrc = this.$route.query.pdfsrc;
       pdfsrc = decodeURIComponent(pdfsrc);
       this.dowloadpdfsrc = pdfsrc
      //  this.src = encodeURI(pdfsrc);
      // let src = pdf.createLoadingTask({
      //   url: pdfsrc,
      //   //引入pdf.js字体，templ
      //   cMapUrl: '../../assets/cmaps/',
      //   cMapPacked: true
      // })
      // this.src = src
      this.src = pdf.createLoadingTask({ url: encodeURI(pdfsrc), CMapReaderFactory })
    }
  }
};
</script>

<style lang="less" scoped>
.pdf {
  background: #585858;
  .arrow {
    margin: 0;
    font-size: 2rem;
    line-height: 2rem;
    padding: 2px 5px;
    display: flex;
    position: fixed;
    top: 0;
    width: 100%;
    height: 40px;
    color: #fff;
    background: #2c3e50;
    flex-direction: row;
    align-items: center;
    z-index: 999;
    width: calc(100% - 24px);
    justify-content: space-between;
    span {
      background: #333;
      border-radius: 4px;
      font-size: 2rem;
      padding: 0 10px;
      margin-right: 1rem;
    }
    i {
      margin-right: 1rem;
    }
  }
}
</style>


