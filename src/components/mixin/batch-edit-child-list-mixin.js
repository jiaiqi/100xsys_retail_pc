export default {
    data() {
        return {
            batchCheckDialogVisible:false,
            batchAddButton:null,
            batchAddData:[],
            groupByLayoutData:{}

        }
    },
    computed:{
        gridButtonPos(){
            let pos = "top"
            let config = this.moreConfig && this.moreConfig.hasOwnProperty("gridButtonPos") ? this.moreConfig.gridButtonPos : pos
            return config
        },
        menListCols:function(){
            let cols = []
            let addcol = this.addSrvCols
            cols = addcol.filter((item) => {
                if(item.in_add == 1 || item.in_add == 2){
                    return item
                }
            });
            return cols
        },
        menDataModel:function(){
            let cols = {}
            let addcol = this.menListCols
            addcol.forEach((item) => {
                if(item.in_add == 1 || item.in_add == 2){
                    cols[item.columns] = {
                        value:null,
                        initValue:null,
                        label:item.label,
                        bx_col_type:item.bx_col_type,
                        redundant:item.redundant,
                        init_expr:item.init_expr,
                        updatable:item.updatable
                    }
                }
            });
            return cols
        },
        buildBatchCheckInitValues:function(){
            let models = []
            let initBatchData = this.batchAddData
            for(let item of initBatchData){
                let data = {}
                let initModel = {}
                for(let key in item){
                    data[key] = item[key].value
                }
                for(let key in item){
                    if(item[key].redundant && item[key].redundant.func){
                        // refun = eval(item[key].redundant.func)
                        data[key] = eval(item[key].redundant.func)
                        console.log('eval',eval(item[key].redundant.func))
                    }else{
                        data[key] = item[key].value 
                    }
                }
                models.push(data) 
            }
            return models
        },
        buildInitValuesRedundant:function(){
            let datas = this.bxDeepClone(this.buildBatchCheckInitValues) 
            let models = []
            let initBatchData = this.batchAddData
            let mainData = this.listMainFormDatas
            
            for(let val of datas){
                let data = this.bxDeepClone(val)
                    for(let item of initBatchData){
                        for(let key in item){
                            if(item[key].init_expr && item[key].init_expr.indexOf("'") !== -1){
                                data[key] = item[key].init_expr
                            }else if(item[key].init_expr && item[key].init_expr.indexOf("mainData") !== -1){
                                data[key] = eval(item[key].init_expr)
                            }
                            if(item[key].redundant && item[key].redundant.func){
                                // refun = eval(item[key].redundant.func)
                                let func = item[key].redundant.func
                                data[key] = eval("var zz=" + func + "(data); zz") //eval(item[key].redundant.func)
                                console.log('eval',data[key])
                            }  
                        }
                   
                     }
                     models.push(data)
            }
            return models
        },
        groupByLayoutRun:function(){
            let req = this.moreConfig && this.moreConfig.hasOwnProperty("groupByLayout") ? this.moreConfig.groupByLayout : false
            let groupConfig = req.group || []
            
            let reqData = this.groupByLayoutData
            for(let cfg of groupConfig){
                for(let val in reqData){
                    if(val == cfg.aliasName || val == cfg.colName){
                        cfg["value"] = reqData[val]
                    }
                }
            }
            return groupConfig
        }

    },
    methods: {
        onSelectSave(res){
            let self = this
            console.log(res)
            for(let item of res){
                this.inlineListData(item)
            }
            this.batchCheckDialogVisible =false
        },
        onSelectClancel(res){
            console.log(res)
            this.batchCheckDialogVisible =false
        
        },
        onBatchAddCheckButton(){
            this.batchCheckDialogVisible = true
       },
       inlineListData(e){
           let batchAddColumns = this.moreConfig.childListConfig.batchAdd.columns
          let rowData = this.bxDeepClone(this.menDataModel)
          
          for(let key in e){
            for(let col in rowData){
                if(key == col && col == batchAddColumns){
                    rowData[key].initValue = e
                    rowData[key].value = e[key]
    
                }else if(rowData[col].redundant && rowData[col].redundant.hasOwnProperty("dependField") && rowData[col].redundant.dependField == batchAddColumns){
                    rowData[col].value = e[rowData[col].redundant.refedCol]
                }
            }
            
          }
          let isPush = true
          for(let d of this.buildInitValuesRedundant){
              
                if(e[batchAddColumns] == d[batchAddColumns] ){
                    isPush = false
                }
          }
          if(isPush || this.buildInitValuesRedundant.length == 0){
                
            this.batchAddData.push(rowData)
            this.buildInitRowData(rowData)
          }
       },
       buildBatchAddCheck(e){
           if(this.moreConfig.hasOwnProperty("childListConfig")){
                let config = this.moreConfig.childListConfig
                this.batchAddButton = config
           }
            
       },
       buildInitRowData(e){
            let datas = this.bxDeepClone(this.buildBatchCheckInitValues) 
            let models = []
            let initBatchData = this.batchAddData
            let mainData = this.listMainFormDatas
            let item = e

            let data = {}
            for(let key in item){
                data[key] = item[key].value
                if(item[key].init_expr && item[key].init_expr.indexOf("'") !== -1){
                    data[key] = item[key].init_expr
                }else if(item[key].init_expr && item[key].init_expr.indexOf("mainData") !== -1){
                    data[key] = eval(item[key].init_expr)
                }
                if(item[key].redundant && item[key].redundant.func){
                    // refun = eval(item[key].redundant.func)
                    let func = item[key].redundant.func
                    data[key] = eval("var zz=" + func + "(data); zz") //eval(item[key].redundant.func)
                    console.log('eval',data[key])
                }
                if(item[key].init_expr && item[key].init_expr.indexOf("'") !== -1){
                    console.log('测试',item[key])
                    let reg1 = new RegExp("'","g"); // 加'g'，删除字符串里所有的"a"
                    let str = item[key].init_expr
                    data[key] = str.replace(reg1,"")
                }
            }
            console.log("onAdd2MemSubmitted",data)
            this.onAdd2MemSubmitted(data)
       },
       onRowChangeRedundant(row,column){
           console.log('onRowChangeRedundant',row)
           let menDataModel = this.menDataModel
           let mainData = this.listMainFormDatas
           let data =  this.bxDeepClone(row)
           let model = this.inplaceEditData
            for(let col in row){
                
                for(let field in menDataModel){
                    if(col == field){
                        for(let i = 0;i<model.length;i++){
                            if(typeof(model[i]) == 'object' &&model[i].hasOwnProperty('id') &&data.hasOwnProperty('id')&& model[i].id == data.id){
                                let mode = model[i][column]
                                data[column] = mode.model
                            }
                            if(typeof(model[i]) == 'object' && model[i].hasOwnProperty('_guid') &&data.hasOwnProperty('_guid')&& model[i]._guid == data._guid){
                                let mode = model[i][column]
                                data[column] = mode.model
                            }

                            if(menDataModel[col].init_expr && menDataModel[col].init_expr.indexOf("mainData") !== -1){
                                let expr = menDataModel[col].init_expr
                                data[col] = eval(expr)
                                console.log('eval',mainData,col,data[col])
                            }
                        }
                        
                        if(menDataModel[col].redundant && menDataModel[col].redundant.func){
                            // refun = eval(menDataModel[col].redundant.func)
                            let func = menDataModel[col].redundant.func
                            data[col] = eval("var zz=" + func + "(data); zz") //eval(menDataModel[col].redundant.func)
                            console.log('eval',col,data[col])
                        }
                    }
                }
            }
            let datas = this.gridData
            
            for(let i = 0;i<datas.length;i++){
                if((datas[i].hasOwnProperty('id') && datas[i].id == data.id)){
                    console.log("onRowChangeRedundant",data) 
                    data["_dirtyFlags"] = "update"
                    this.$set(this.gridData,i,data)

                }
                 if((datas[i].hasOwnProperty('_guid') && datas[i]._guid == data._guid)){
                    console.log("onRowChangeRedundant",data) 
                    // data["_dirtyFlags"] = "update"
                    this.$set(this.gridData,i,data)
                 }
            }
       },
       getShowTableSummary(){
          
           let config = this.moreConfig
           let cfg = config && config.hasOwnProperty("showTableSummary") ? config.showTableSummary : false
           if(cfg && cfg.hasOwnProperty("columns") && cfg.columns.length > 0){
               return true
           }else{
               return false
           }
       },
       onSummaryMethod(param){
        const { columns, data } = param;
        const sums = [];
        let config = this.moreConfig
           let cfg = config && config.hasOwnProperty("showTableSummary") ? config.showTableSummary : false
           let cols = cfg.columns
           let colstr = []
           let units = {}
           if(cfg && cfg.columns.length > 0){
                cols.forEach((item)=>{
                    colstr.push(item.column)
                    units[item.column] =  item.unit
                })
           }

        let isCols = function(e){
            let sumCol = false
            for(let item of colstr){
                if(e == item){
                    sumCol = true
                }
            }
            return sumCol
        }
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = cfg.title || '总计';
            return;
          }
          
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value)) && isCols(column.property)) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            let unit = units[column.property]
            sums[index] += unit;
          } else {
            sums[index] = '';
          }
        });

        return sums;
       },
       getGroupByLayout:function(){
           let self = this
            let req = self.moreConfig.hasOwnProperty("groupByLayout") ? self.moreConfig.groupByLayout : false
            let reqCond = {
                "serviceName": "srvretail_loss_reporting_detail_report_select",
                "colNames": [
                    "*"
                ],
                "condition": [],
                "relation_condition": {},
                "page": {
                    "pageNo": 1,
                    "rownumber": 999
                },
                "order": [],
                "group":[
                {
                    "colName":"goods_name",
                    "type":"count",
                    "aliasName":"商品总数"
                },
                {
                    "colName":"loss_num",
                    "type":"sum",
                    "aliasName":"报损数量"
                },
                {
                    "colName":"sale_amount",
                    "type":"sum",
                    "aliasName":"报损金额"
                }
                ]
            }
            reqCond.serviceName = req.serviceName
            reqCond.condition = req.condition || reqCond.condition
            reqCond.page = req.page || reqCond.page
            reqCond.group = req.group

            if(req){
                self.select(reqCond.serviceName, reqCond.condition, reqCond.page, null, reqCond.group, null, null,null,null,null,null,null).then((reqData) =>{
                    let data = reqData.data.data
                    console.log("getGroupByLayout:",reqData,reqData.data)
                    if(data.length > 0){
                        
                         console.log("getGroupByLayout:",reqData,reqData.data,data)
                        self.groupByLayoutData =  data[0]
                    }

                })
            }
        }
    },
    watch:{
        "moreConfig":{
            deep: true,
          immediate: true,
            handler:function(newVal,oldVal){
                if(newVal && newVal.hasOwnProperty('groupByLayout')){
                    this.getGroupByLayout()
                }
            }
        }
    }
  
  };
  