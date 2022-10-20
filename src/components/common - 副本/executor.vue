<template>
</template>

<script>
  import ExecutorMixin from '../mixin/executor-minx'
  import {ExecutorInfo} from '../model/ExecutorInfo'

  export default {
    mixins: [ExecutorMixin],

    props: {
      service: String,
      values: Array,
      conditions: Array,
      ignoreNullValue: Boolean,
      itemsFunc: null,
      itemsPolicy: "valuePerItem",  // or servicePerItem
      dependKeys: [],
      defaultValues:Object
    },

    data() {
      return {
        children: [],
      };
    },

    methods: {
      /**
       * return an query object
       * */
      buildSrvQuery: function (conf, item4Srv, rtDataCtx) {
        let query = {}
        query.serviceName = conf.service
        // buildConditionsFromConf方法获取到了condition
        query.condition = this.buildConditionsFromConf(conf, item4Srv)
        query.depend_keys = conf.dependKeys;

        if (conf.itemsFunc) {
          let validItems = (conf.itemsFunc)(rtDataCtx)
            .filter(item => item._dirtyFlags !== "delete");
          let evalItems = validItems
            .map(item => this.buildValuesFromConf(conf, item))
            .map(item => {
              if (conf.dependKeys) {
                conf.dependKeys.forEach(depend => delete item[depend.add_col]);
              }
              return item;
            });
          query.data = evalItems
        } else {
          let data = this.buildValuesFromConf(conf)
          query.data = data ? [data] : []
        }
        if (query.serviceName.endsWith("add") || query.serviceName.endsWith("update")) {
          if (!query.data || query.data.length == 0) {
            return null;
          }
        } else if (query.serviceName.endsWith("delete") || query.serviceName.endsWith("update")) {
          if (!query.condition || query.condition.length == 0) {
            return null;
          }
        }
        
        return query;
      },

      /**
       *
       * @param conf
       * @returns {*} an array of queries
       */
      buildQuery: function (conf, rtDataCtx) {
        let queries = [];
        if (conf.itemsFunc && conf.itemsPolicy === "servicePerItem") {
          let clone = _.cloneDeep(conf);
          clone.itemsPolicy = "valuePerItem";
          queries = (conf.itemsFunc)(rtDataCtx).map(item => {
            clone.itemsFunc = _ => [item];
            return this.buildSrvQuery(clone, item, item)
          })
        } else {
          let query = this.buildSrvQuery(conf, null, rtDataCtx);
          queries = [query];
        }
        queries = queries.filter(e => !!e);
        if (conf.children && conf.children.length > 0) {
          queries.forEach(query => {
            if (query) {
              query.data.forEach(item => {
                let subQueries = conf.children.map(child => this.buildQuery(child, item._rtDataCtx)).filter(e => !!e);
                subQueries = _.flatten(subQueries).filter(e => !!e);

                if (subQueries && subQueries.length > 0) {
                  item.child_data_list = subQueries;
                }
              })
            }
          })
        }
        return queries;
      },

      buildRunQuries() {
       
        let queries = this.buildQuery(this);
        if (!queries || queries.length == 0) {
          return Promise.resolve(false);
        }

        this.santinizeQueries(queries)

        return queries;
      },

      run(e,kval,isDraft) {
        let self = this
        let queries = this.buildQuery(this);
        /**
           * 保存草稿独有属性 draft
           */
          if(e.name === 'save_draft'){
                queries = queries.map((item,index)=>{
                    if(e.executor.service === item.serviceName){
                      item.reqType="saveDraft"
                    }
                    return item
                })
            }
           if(e.name === 'submit' && isDraft=== 'draft'){
             queries = queries.map((item,index)=>{
                    if(e.executor.service === item.serviceName){
                      item.reqType="submitDraft"
                    }
                    return item
                })
           }
          // submitDraft 
          // if(e.hasOwnProperty('draftConfig') && e.name === 'save_draft'){
          //   let config = e.draftConfig
          //   let paramsData =  config.status_config
          //   let formModelDatas = queries[0].data[0]
          //   formModelDatas[paramsData.colName] = paramsData.draftValue
          //   if(e.draftConfig.isDraft){
          //     queries = queries.map((item,index)=>{
          //           if(e.executor.service === item.serviceName){
          //             item.draft = true
          //             if(kval.value !== null){
          //               item.condition.push({'colName':kval.colName,'ruleType':'eq',value:kval.value})
          //               item.serviceName = e.draftConfig.update_srv
          //             }
          //           }
          //           return item
          //       })
          //   }
          // }else if(e.hasOwnProperty('draftConfig') && e.name === 'update_draft'){
          //   let config = e.draftConfig
          //   let paramsData =  config.status_config
          //   let formModelDatas = queries[0].data[0]
          //   formModelDatas[paramsData.colName] = paramsData.draftValue
          //   queries = queries.map((item,index)=>{
          //           if(e.executor.service === item.serviceName){
          //             item.draft = true
          //           }
          //           return item
          //       })
          // } else if(e.hasOwnProperty('draftConfig')  &&  e.draftConfig !== null && e.draftConfig.isDraft && (e.name === 'submit')){
          //   let config = e.draftConfig
          //   let paramsData =  config.status_config
          //   let formModelDatas = queries[0].data[0]
          //   formModelDatas[paramsData.colName] = paramsData.value
          //   if(e.draftConfig.isDraft){
          //     queries = queries.map((item,index)=>{
          //           if(e.executor.service === item.serviceName){
          //             if(kval.value !== null){
          //               item.condition.push({'colName':kval.colName,'ruleType':'eq',value:kval.value})
          //               item.serviceName = e.draftConfig.update_srv
          //             }
          //           }
          //           return item
          //       })
          //   }
          // }
          
        if (!queries || queries.length == 0) {
          return Promise.resolve(false);
        }

        this.santinizeQueries(queries)

        return this.operate(queries)
          .then((response) => {
            if (response && response.data) {
              if (response.data.state == 'SUCCESS') {

                // only for local refresh of treegrid
                response.request = queries[0];
                this.$emit("executor-complete", response);
                return response;
             
              }
            }
          });
      }
    }
  }
</script>
