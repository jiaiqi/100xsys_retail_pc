<template>
</template>

<script>
  import ExecutorMixin from '../mixin/executor-minx'

  export default {
    mixins: [ExecutorMixin],
    props: {
      service: {
        type: String,
        default: 'srvsso_user_select'
      },
      pageIsDraft: {
        type: String,
        default: 'norm',
      },
    isHistory:{
      type:Boolean,
      default(){
        return false
      }
    }
    },
    data() {
      return {
        enableFunc: null,
        colNames: [],
        conditions: [],
        ignoreNullValue: true,

        lastValidResp: null,
        loadCount: 0,
      }
    },

    mounted: function () {
    },

    methods: {
      run(condition) {
        if(Array.isArray(condition)&&condition.length>0){
          this.conditions = condition
        }
        if(this.enableFunc && !this.enableFunc()){
          return Promise.resolve(false);
        }

        let query = {}
        query.serviceName = this.service
        

        query.condition = this.buildConditions(this.pageIsDraft)
        if (!query.condition) {
          return
        }

        query.colNames = this.colNames;
        query.hisVer = this.isHistory;   // 是否加载历史版本
        // 处理草稿标记

        if((this.pageIsDraft && this.pageIsDraft === 'draft') || (this.hasOwnProperty('$route')  && this.$route.query.isdraft === 'true')){
         // console.log('page Is Draft',this.pageIsDraft)
          query['draft'] = (this.pageIsDraft === 'draft') || this.$route.query.isdraft === 'true'
        }
        //---
        return this.selectList( query).then((response) => {
          if (response && response.data && response.data.data) {
            this.lastValidResp = response.data.data;
            this.loadCount++;
          }

          this.$emit('loader-complete', {data: response.data.data, resp: response} );
        })
      },

      watchCondition() {
        this.unwatchCondition();

        this.unwatchCondFunc = this.$watch(
          function () {
            return this.buildConditions();
          },

          function (newVal, oldVal) {
            
            this.run();
          }
        );
      },

      unwatchCondition() {
        if (this.unwatchCondFunc) {
          this.unwatchCondFunc();
          this.unwatchCondFunc = null;
        }
      },

    }
  }
</script>
