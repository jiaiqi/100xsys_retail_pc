export default {
    // props:{
    //     approvalOptions:{
    //         type:Array,
    //         default(){
    //             return []
    //         }
    //     },
    //     approvaList:{
    //         type:Array,
    //         default(){
    //             return []
    //         }
    //     }
    // },
    methods: {
        /** 
         * 根据表单 show_ui_cond 获取业务表单显示隐藏
         * @param childList  , mainFromData
         * @returns true || false
        */
        getShowBizForm(proCharData,mainFromData,initStepNo){
            if(proCharData && mainFromData && initStepNo){
            let pcd = proCharData
            for(let bizItem = 0; bizItem < pcd.length; bizItem++ ){
                let item = pcd[bizItem]
                if(item.biz_cfg_data.length > 0 && item.step_no === initStepNo){
                    for( let formItem = 0; formItem <  item.biz_cfg_data.length;formItem++){
                        let bizDataItem = item.biz_cfg_data[formItem]
                        let showFun = bizDataItem.show_ui_cond
                        let paramsData = {}
                        let mainData = mainFromData
                        if(showFun !== null && showFun !== undefined){
                            try {
                                let funcTest = new Function('return '+ showFun )
                                let s = funcTest()

                                bizDataItem['_isLoad'] = s(paramsData,mainData)
                                if(!s(paramsData,mainData)){
                                    item.biz_cfg_data.splice(formItem,1)
                                }
                                // bizDataItem['_isLoad'] = showForm(params,mainData)
                                // return eval(showFun);
                            } catch (e) {
                              
                            }
                        }else{
                            bizDataItem['_isLoad'] = true
                        }
                    }
                
                }else{
                    for( let formItem = 0; formItem <  item.biz_cfg_data.length;formItem++){
                        let bizDataItem = item.biz_cfg_data[formItem]
                        bizDataItem['_isLoad'] = true
                    }
                }
            }


            return pcd
            }
            
        },
        async submitApprovalForm(bxRequests) {
            let self = this;
            //提交流程
            console.log("bxRequests",bxRequests)
            this.approval(bxRequests).then(response => {
                var state = response.body.state;
                if ("SUCCESS" == state) {
                  this.$message({
                    type: "success",
                    message: "审批成功!"
                  });
                  self.$emit('action-success')
                } else {
                  this.$message({
                    type: "error",
                    message: response.body.resultMessage
                  });
                }
              });
          },
    },
    
}