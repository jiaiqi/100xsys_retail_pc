export default {

  methods: {
    /**
     * 自定义按钮校验配置
     */
    checkCustomButton(btn){
      let service = btn.operate_service

      if(service){
        return true
      }else{
        return false
      }
    },
    /**
     * 自定义按钮操作 v2.0 2021/04/07
     * @param {*} button 
     * @param {*} operateData 
     */
    customButtonV2(button,operateData,buttonPose){
      let data = operateData
      let buttonInfo = button
      let operate_type = buttonInfo.iav_page_type || null
      let iav_model = buttonInfo.iav_model || null
      let checkConfig = this.checkCustomButton(buttonInfo)
      if(checkConfig){
        if(iav_model === '弹出'){
          // if(operate_type == '修改表单'){
          //   if(button.operate_service && Object.prototype.toString.call(button.operate_service) !== "[object String]"){
          //     let srv = this.getButtonOptSrv(button,row,"active")
          //     if(srv.length > 0){
          //       this.rowButtonActiveServiceName = srv[0].serviceName 
          //     }else{
    
          //     }
              
          //   }else{
          //     this.rowButtonActiveServiceName = button.operate_service ||  button.service_name
          //   }
          //  let actionConfig = this.getButtonOptSrv(button,row,'active')
          //   console.log('getButtonOptSrv',actionConfig)
          //   self.onUpdateClicked(row);
          // }
        }
      }else{
        alert('[按钮配置错误]:'+ JSON.stringify(buttonInfo))
      }
      
     
      console.log('custom Button V2 :',data,buttonInfo)
     
    },
    /**
     * 自定义操作1.0
     * @param {*} butinfo 
     * @param {*} operateData 
     */

    customizeOperate(butinfo, operateData) {


      var application = butinfo.application;
      var operate_type = butinfo.operate_type;
      if (operate_type == "操作") {
        this.customize_operate(butinfo, operateData);
      } else if (operate_type == "流程申请") {
        this.customize_apply(butinfo, operateData);
      } else if (operate_type == "修改") {
        this.customize_update(butinfo, operateData);
      } else if (operate_type == "删除") {
        this.customize_delete(butinfo, operateData);
      } else if (operate_type == "增加") {
        this.customize_add(butinfo, operateData);
      } else if(operate_type == "草稿"){
      return  this.customize_save(butinfo, operateData)
      }else if (operate_type.endsWith("URL跳转")) {
        this.customizeurlFoward(butinfo, operateData);
      } else if (operate_type.endsWith("地址访问")) {
        this.addressRequest(butinfo, operateData);
      } else if (operate_type.endsWith("跳转")) {
        this.customize_forward(butinfo, operateData);
      } else if (operate_type.endsWith("弹出")) {
        this.customize_popup(butinfo, operateData);
      } else {
        alert("暂未实现");
      }



    },
    /**
     * 前置数据处理
     */
    pre_data_handle(butinfo, operateData) {

      var me=this;
      var pre_data_handle = butinfo.pre_data_handle;
      if (pre_data_handle != undefined && pre_data_handle != null && pre_data_handle != '') {

        if(operateData){
          if(operateData.length==0){
            operateData=[{}];
          }
        }

        eval("var zz=" + pre_data_handle + "(operateData,me); zz");
      }
      return operateData;

    },

    /**
     * 后置动作
     * @param {*} butinfo 
     */
    suffix_actions(butinfo) {

      var page_type = butinfo.page_type;
      var suffix_actions = butinfo.suffix_actions;

      if (page_type && page_type.endsWith("列表")) {

        this.loadTableData();
      } else {

        if (suffix_actions == 'refresh') {
          window.location.reload();
        }

      }

    },

    /**
     * 组装参数数据
     * @param {*} butinfo 
     * @param {*} operateData 
     */
    getchildPackageData(childRequests, operateData) {

      var bxRequests = [];
      if (childRequests != null && childRequests != '' && childRequests != undefined) {


        for (var requestTtem of childRequests) {
          var request = {};
          request.serviceName = requestTtem.serviceName;
          if(requestTtem["data"]!=undefined){
            request.data = requestTtem["data"];
          }
          
          if(requestTtem["condition"]!=undefined){
            
              request.condition = requestTtem["condition"];
          }
 
          var depend_keys = requestTtem["depend_keys"];
          if (depend_keys != undefined && depend_keys != "" && depend_keys != null) {
            request["depend_keys"] = depend_keys;
          }
          var depend_condition_keys = requestTtem["depend_condition_keys"];

          if (depend_condition_keys != undefined && depend_condition_keys != "" && depend_condition_keys != null) {
            request["depend_condition_keys"] = depend_condition_keys;
          }
          bxRequests.push(request);
        }
      }

      return bxRequests;

    },


    /**
     * 组装参数数据
     * @param {*} butinfo 
     * @param {*} operateData 
     */
    getPackageData(butinfo, operateData) {

      var packagedata = {};
      var new_data = {};
      var new_conditions = [];
      //按钮操作参数
      var operate_params = JSON.parse(butinfo["operate_params"]);

      if (operate_params != '' && operate_params != null) {


        var data = operate_params["data"];
        /**
         * 增加是否合并配置，"is_merge" = true 参数数据与 operateData 合并，operate_params.data 优先
         */
        var isMerge = false
        if(operate_params.hasOwnProperty('is_merge')){
          isMerge = operate_params["is_merge"]
        }

        if (data != undefined && data != null && data != null) {
          new_data = {};
          for (var data_item of data) {

            for (var col_key in data_item) {

              if (col_key == 'child_data_list') {

                var childParams = data_item["child_data_list"];
                var childRequests = this.getchildPackageData(childParams, operateData);
                if (childRequests.length > 0) {
                  new_data["child_data_list"] = childRequests;
                }

              } else {
                
                var col_cfg = data_item[col_key];
                if(isMerge){
                  new_data =  operateData[0]
                }
                if (col_cfg["value_type"] == "constant") {

                  new_data[col_key] = col_cfg["value"];

                } else if (col_cfg["value_type"] == "sysvar") {

                  if (col_cfg["value"] == 'nowdate') {
                    new_data[col_key] = this.formatDateTime(new Date());
                  } else {
                    new_data[col_key] = eval("top." + col_cfg["value"]);
                  }


                } else if (col_cfg["value_type"] == "rowData") {

                  if (operateData.length > 0) {
                    new_data[col_key] =
                      operateData[0][col_cfg["value_key"]];
                  } else {
                    new_data[col_key] = null;
                  }

                } else if (col_cfg["value_type"] == "mainData") {
                  // 主表数据
                  if(this.listMainFormDatas && typeof this.listMainFormDatas === 'object' && Object.keys(this.listMainFormDatas).length>0){
                    new_data[col_key] = this.listMainFormDatas[col_cfg["value_key"]] || null;
                  }
                }
                

              }

            }
          }
        }


        var condition = operate_params["condition"];
        if (condition != undefined && condition != null && condition != null) {

          for (var condition_item of condition) {
            var newCondition = {};
            newCondition["colName"] = condition_item["colName"];
            newCondition["ruleType"] = condition_item["ruleType"];
            var valueCfg = condition_item["value"];

            var value_type = valueCfg["value_type"];
            if (value_type == "constant") {
              newCondition["value"] = valueCfg["value"];
            } else if (value_type == "sysvar") {

              if (valueCfg["value"] == 'nowdate') {
                newCondition["value"] = this.formatDateTime(new Date());
              } else {
                newCondition["value"] = eval("top." + valueCfg["value"]);
              }

            }
            else if (value_type == "rowData") {
              var value_key = valueCfg["value_key"];
              var value_str = "";
              for (var rowMap of operateData) {
                value_str = value_str + "," + rowMap[value_key];
              }
              value_str = value_str.substring(1);
              newCondition["value"] = value_str;
            }
            new_conditions.push(newCondition);
          }
        }else{
          if(butinfo.servcie_type === 'update' ){
            if(operateData.length === 1 && operateData[0].hasOwnProperty('id')){
              let condition = {
                colName: "id",
                ruleType: "eq",
                value: operateData[0].id
              }
              new_conditions.push(condition)
            }
          }
        }
      }

      packagedata.data = new_data;
      packagedata.conditions = new_conditions;
      return packagedata;

    },

    /**
     * 自定义模式操作2.0
     * @param {*} butinfo 
     * @param {*} operateData 
     */
    customize_operate(butinfo, operateData) {

      this.pre_data_handle(butinfo, operateData);

      var operate_mode = butinfo.operate_mode;

      var operate_service = butinfo.operate_service;
      var packageData = this.getPackageData(butinfo, operateData);
      var new_data = packageData.data;
      var new_conditions = packageData.conditions;
      var page_type = "";


      if (new_conditions.length == 0 && operateData.length != 0) {

        var cMap = { "colName": "id", "value": "", "ruleType": "in" };
        var value_ids = "";
        for (var itemdata of operateData) {
          value_ids = value_ids + "," + itemdata.id;
        }
        value_ids = value_ids.substring(1);
        cMap.value = value_ids;
        new_conditions.push(cMap);
      }
      if ("弹出" == operate_mode) {

        if (operateData.length == 0) {
          this.$alert("请选择操作数据", "提示", {
            confirmButtonText: "确定"
          });
        } else {
          page_type = "list_update";
          this.popuplistFormDialog(page_type, operate_service, butinfo.listservice, new_conditions, new_data);
        }


      } else if ("跳转" == operate_mode) {

      } else if ("静默操作" == operate_mode) {
        var me = this;

        var operate_params_cfg = butinfo.operate_params;
        var bxRequests = [];
        if ((butinfo.select_data == null || butinfo.select_data == undefined || butinfo.select_data == '是') && operateData.length <= 0 &&
          operate_params_cfg != undefined &&
          operate_params_cfg != "" &&
          operate_params_cfg != null) {
          this.$alert("请选择操作数据", "提示", {
            confirmButtonText: "确定"
          });
        } else {
          var pre_confirm_msg = butinfo["pre_confirm_msg"];
          if (pre_confirm_msg == "" || pre_confirm_msg == undefined || pre_confirm_msg == null) {
            pre_confirm_msg = "你确定要进行此操作?";
          }
          this.$confirm(pre_confirm_msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info"
          })
            .then(() => {
              var request = {};

              request["serviceName"] = butinfo["operate_service"];
              request["data"] = [new_data];
              request["srvApp"]=butinfo["application"];
              request["condition"] = new_conditions;
              bxRequests.push(request);
              if (bxRequests.length > 0) {
                this.operate(bxRequests).then(response => {
                  var state = response.body.state;

                  if ("SUCCESS" == state) {

                    var resultMessage = "操作成功!";

                    if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                      resultMessage = response.body.resultMessage;
                    }
                    this.$message({
                      type: "success",
                      message: resultMessage
                    });

                    this.suffix_actions(butinfo);
                    //me.loadTableData();
                  } else {
                    this.$message({
                      type: "error",
                      message: response.body.resultMessage
                    });
                  }
                });
              }
            })
            .catch((e) => {
              
              this.$message({
                type: "info",
                message: "已取消"
              });
            });
        }

      }

    },

    /**
     * 申请
     * @param {*} butinfo 
     * @param {*} operateData 
     */
    customize_apply(butinfo, operateData) {

      this.pre_data_handle(butinfo, operateData);
      var operate_service = butinfo.operate_service;
      var packageData = this.getPackageData(butinfo, operateData);
      var new_data = packageData.data;
      var new_conditions = packageData.conditions;

      var urlParams = "/" + new_data.proc_service;

      var operate_params_str = encodeURI(JSON.stringify(new_data));
      var application = butinfo.application;

      urlParams = urlParams + "?srvApp="+application+"&operate_params=" + operate_params_str + "&time=" + new Date().getTime();
      this.custAddTab("start-proc_v2", urlParams, "流程申请",butinfo);



    },

    /**
     * 直接请求地址
     */
    addressRequest(item, operateData) {


      var address = "";
      var back_url = this.url_pre_data_handle(item, operateData);
      if (back_url != '') {
        address = back_url;
      } else {


        var url = item["operate_params"];
        if (url != '' && url != null && url != undefined) {
          var urls = url.split("/")
          var index = 0;
          for (var step of urls) {

            if (step.startsWith("{") && step.endsWith("}")) {

              var col_key = step.substring(1, step.length - 1);
              if (operateData.length > 0) {
                urls[index] = operateData[0][col_key];
              }
            }
            index++;
          }
        }

        address = urls.join("/");

      }
      if("新TAB"==item.operate_mode){
        window.open(address, '_blank');
      }else{
        window.location.href = address;
      }
      

    },
    /**
     * url跳转打开tab页签
     */
    customizeurlFoward(item, operateData) {
      var mainDetailData = this.listMainFormDatas || null
      var address = "";
      var back_url = this.url_pre_data_handle(item, operateData,mainDetailData);
      if (back_url != '') {
        address = back_url;
      } else {


        var url = item["operate_params"];
        if (url != '' && url != null && url != undefined) {
          var urls = url.split("/")
          var index = 0;
          for (var step of urls) {

            if (step.startsWith("{") && step.endsWith("}")) {

              var col_key = step.substring(1, step.length - 1);
              if (operateData.length > 0) {
                urls[index] = operateData[0][col_key];
              }
            }
            index++;
          }
        }

        address = urls.join("/");

      }



      let more_config = ''
      if(item&&item.more_config){
        more_config = item.more_config
      }
      
      if("新TAB"==item.operate_mode){
        window.open(address, '_blank');
      }else{
        let _tab_title= item.service_view_name;
        if(_tab_title==null||_tab_title==""||_tab_title==undefined){
          _tab_title=item.button_name;
        }
        this.forwardAddTab(address, item.service_view_name,item);
      }

      


    },
    /**
     * url跳转前置处理
     */
    url_pre_data_handle(item, operateData,mainDetailData) {
      let self = this
      
      var back_url = "";
      var pre_data_handle = item.pre_data_handle;
      if (pre_data_handle != undefined && pre_data_handle != null && pre_data_handle != '') {
        // var mainDetailData = self.listMainFormDatas || null
        back_url = eval("var zz=" + pre_data_handle + "(operateData,mainDetailData,self); zz");
        // back_url = eval(pre_data_handle);
        if(back_url && back_url.indexOf('srvApp')==-1){
          let opt = '&'
          if(back_url.indexOf('?')==-1){
            opt = '?'
          }
          back_url = `${back_url}${opt}srvApp=${this.$srvApp?this.$srvApp:item.application && item.application !== 'this'? item.application:''}`
        }
      }
      return back_url;
    },

    /**
     * 自定义页面弹出
     * @param {*} item 
     * @param {*} operateData 
     */
    customize_popup(item, operateData) {

      operateData = this.pre_data_handle(item, operateData);
      var service = item["operate_service"];
      var new_conditions = [];
      var new_data = {};
      var page_type = "";
      var operate_type = item.operate_type;

      var load_old_data = true;
      var operate_params = JSON.parse(item["operate_params"]);


      if (operate_params != '' && operate_params != null) {

        var load_data = operate_params.load_data;
        if (load_data == false) {
          load_old_data = load_data;
        }

        var packageData = this.getPackageData(item, operateData);
        new_data = packageData["data"];
        new_conditions = packageData["conditions"];



      }


      var params={};
      params["service"]=service;
      params["condition"]=new_conditions;
      params["data"]=new_data;
      params["btninfo"]=item;

      params["childForeignkey"]=this.childForeignkey;
      params["defaultCondition"]=this.defaultCondition;
      params["listMainFormDatas"]=this.listMainFormDatas;
     

      if ("列表弹出" == operate_type) {
        params.formType="list";
    
        this.popupDialog(params);
      } else if ("详情弹出" == operate_type) { 

        params.formType= "detail";
        this.popupDialog(params);


      } else if ("增加弹出" == operate_type) {

        // params.formType= "simple-add";
        params.formType= "add";
        this.popupDialog(params);

      } else if ("更新弹出" == operate_type) {


        var otherParams = {};
        otherParams["load_old_data"] = load_old_data;
        params.formType= "simple-update";
        otherParams["buttonInfo"]=item;
        params["otherParams"]=otherParams;
        this.popupDialog(params);

      } else if ("编辑列表弹出" == operate_type) {

        params.formType= "editgrid";
        this.popupDialog(params);
      } else if ("树列表弹出" == operate_type) {

        params.formType= "treegrid";
        this.popupDialog(params);

      } else {
        alert(operate_type + ":暂未实现");
      }


    },
    addListpoup(service, conditions, mapcondition) {
      var data = {};

      var params={};
      params.formType= "selectlist";
      params["service"]=service;
      params["condition"]=conditions;
      params["data"]=data;
      params["mapcondition"]=mapcondition;
      this.popupDialog(params);
    },
    /**
     * 自定义跳转
     * @param {*} item 
     * @param {*} operateData 
     */
    customize_forward(item, operateData) {

      this.pre_data_handle(item, operateData);

      var me = this;
      var service = item["operate_service"];

      var operate_type = item["operate_type"];
      var page_type = "";
      var bxRequests = [];


      var operate_params = JSON.parse(item["operate_params"]);
      if (operate_params != '' && operate_params != null) {

        var request = {};

        request["serviceName"] = item["operate_service"];

        var colNames = operate_params["colNames"];
        if (colNames != undefined && colNames != null && colNames != null) {
          request["colNames"] = colNames;
        }

        var order = operate_params["order"];
        if (order != undefined && order != null && order != null) {
          request["order"] = order;
        }

        var page = operate_params["page"];
        if (page != undefined && page != null && page != null) {
          request["page"] = page;
        }

        var data = operate_params["data"];


        var packageData = this.getPackageData(item, operateData);
        var new_data = packageData["data"];
        var new_conditions = packageData["conditions"];
        var requestData = [];
        request["data"] = requestData;
        if(JSON.stringify(new_data)=="{}"){

        }else{
          requestData.push(new_data);
        }
    
        request["condition"] = new_conditions;
        bxRequests.push(request);

      }


      var operate_params_str = "";
      if (bxRequests.length > 0) {
        operate_params_str = encodeURI(JSON.stringify(bxRequests[0]));

      }

      var urlParams = "/" + service;


      if ("列表跳转" == operate_type) {

        page_type = "list";
      } else if ("详情跳转" == operate_type) {

        page_type = "detail";
        urlParams = urlParams + "/-1"

      } else if ("增加跳转" == operate_type) {

        page_type = "simple-add";

      } else if ("更新跳转" == operate_type) {

        urlParams = urlParams + "/-1"
        page_type = "simple-update";

      } else if ("编辑列表跳转" == operate_type) {

        page_type = "editgrid";
      }

      var application=item["application"];
      urlParams = urlParams + "?operate_params=" + operate_params_str + "&time=" + new Date().getTime();
      if(application){
         urlParams = urlParams+"&srvApp="+application;
      }
      this.custAddTab(page_type, urlParams, item.service_view_name,item);

    },

    // 自定义保存草稿
    customize_save(item, operateData){
      let _self=this
      this.pre_data_handle(item, operateData);

      var operate_params_cfg = item.operate_params;
      var me = this;
      var bxRequests = [];
      operate_params_cfg = JSON.parse(operate_params_cfg)
      let isMerge = operate_params_cfg.is_merge !== undefined ? operate_params_cfg.is_merge : false
      let draft = operate_params_cfg.draft !== undefined ? operate_params_cfg.draft : false
      let paramsData =  operate_params_cfg.data !== undefined ? operate_params_cfg.data : false
      if(operate_params_cfg.draft){
        /**
         * 保存草稿和静态参数处理
         */
        if(paramsData && isMerge){
          for(let i=0;i<paramsData.length; i++){
            let keys = Object.keys(paramsData[i])
            for(let j =0;j<keys.length;j++){
              // 参数处理

              if(paramsData[i].value_type === 'constant'){
                operateData[keys[j]] = paramsData[i][keys[j]].value
              }
            }
          }
        }
      }
      if (operateData.length <= 0 && operate_params_cfg != undefined && operate_params_cfg != "" && operate_params_cfg != null) {
        this.$alert("请选择操作数据", "提示", {
          confirmButtonText: "确定"
        });
      } else {
        var pre_confirm_msg = item["pre_confirm_msg"];
        if (pre_confirm_msg == "" || pre_confirm_msg == undefined || pre_confirm_msg == null) {
          pre_confirm_msg = "你确定要进行此操作?";
        }
        
          // .then(() => {
            var request = {};
            var requestData = [];
            request["serviceName"] = item["operate_service"];
            request["data"] = requestData;
            if(draft){
              request["draft"] = draft
            }
            
            var operate_params = JSON.parse(item["operate_params"]);

            var packageData = this.getPackageData(item, operateData);
            var new_data = packageData["data"];
            var new_conditions = packageData["conditions"];

            if(JSON.stringify(new_data)=="{}"){
            }else{
              requestData.push(new_data);
            }
           
            request["condition"] = new_conditions;
            request["srvApp"]=item["application"];
            bxRequests.push(request);
            if (bxRequests.length > 0) {
            //  _self.$confirm(pre_confirm_msg, "提示", {
            //     confirmButtonText: "确定",
            //     cancelButtonText: "取消",
            //     type: "info"
            //   })
              // .then(()=>{
                return this.operate(bxRequests).then(response => {
                  var state = response.body.state;
  
                  if ("SUCCESS" == state) {
  
                    var resultMessage = "操作成功!";
  
                    if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                      resultMessage = response.body.resultMessage;
                    }
  
                    this.$message({
                      type: "success",
                      message: resultMessage
                    });
  
                    this.suffix_actions(item);
                    // me.loadTableData();
                  } else {
                    this.$message({
                      type: "error",
                      message: response.body.resultMessage
                    });
                  }
                });
              // }).catch(() => {
              //   this.$message({
              //     type: "info",
              //     message: "已取消"
              //   });
              // });
              
            }
          // })
          
      }
    },
    /**
     * 自定义更新
     * @param {*} item 
     * @param {*} operateData 
     */
    customize_update(item, operateData) {
      this.pre_data_handle(item, operateData);
      var me = this;
      var bxRequests = [];

      var operate_params_cfg = item.operate_params;

      if (operateData.length <= 0 && operate_params_cfg != undefined && operate_params_cfg != "" && operate_params_cfg != null) {
        this.$alert("请选择操作数据", "提示", {
          confirmButtonText: "确定"
        });
      } else {
        var pre_confirm_msg = item["pre_confirm_msg"];
        if (pre_confirm_msg == "" || pre_confirm_msg == undefined || pre_confirm_msg == null) {
          pre_confirm_msg = "你确定要进行此操作?";
        }
        this.$confirm(pre_confirm_msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {



            var request = {};
            var requestData = [];
            request["serviceName"] = item["operate_service"];
            request["data"] = requestData;
            var operate_params = JSON.parse(item["operate_params"]);


            var packageData = this.getPackageData(item, operateData);
            var new_data = packageData["data"];
            var new_conditions = packageData["conditions"];
         

            if(JSON.stringify(new_data)=="{}"){
            }else{
              requestData.push(new_data);
            }

            request["condition"] = new_conditions;
            request["srvApp"]=item["application"];
            bxRequests.push(request);


            if (bxRequests.length > 0) {
              this.operate(bxRequests).then(response => {
                var state = response.body.state;

                if ("SUCCESS" == state) {

                  var resultMessage = "操作成功!";

                  if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                    resultMessage = response.body.resultMessage;
                  }
                  this.$message({
                    type: "success",
                    message: resultMessage
                  });

                  this.suffix_actions(item);
                  //me.loadTableData();
                } else {
                  this.$message({
                    type: "error",
                    message: response.body.resultMessage
                  });
                }
              });
            }


          })
          .catch((e) => {
            
            this.$message({
              type: "info",
              message: "已取消"
            });
          });
      }
    },
    /**
     * 自定义增加
     * @param {*} item 
     * @param {*} operateData 
     */
    customize_add(item, operateData) {
      let _self=this
      this.pre_data_handle(item, operateData);

      var operate_params_cfg = item.operate_params;
      var me = this;
      var bxRequests = [];
      
      if (operateData.length <= 0 && operate_params_cfg != undefined && operate_params_cfg != "" && operate_params_cfg != null) {
        this.$alert("请选择操作数据", "提示", {
          confirmButtonText: "确定"
        });
      } else {
        var pre_confirm_msg = item["pre_confirm_msg"];
        if (pre_confirm_msg == "" || pre_confirm_msg == undefined || pre_confirm_msg == null) {
          pre_confirm_msg = "你确定要进行此操作?";
        }
        
          // .then(() => {
            var request = {};
            var requestData = [];
            request["serviceName"] = item["operate_service"];
            request["data"] = requestData;
            var operate_params = JSON.parse(item["operate_params"]);

            var packageData = this.getPackageData(item, operateData);
            var new_data = packageData["data"];
            var new_conditions = packageData["conditions"];

            if(JSON.stringify(new_data)=="{}"){
            }else{
              requestData.push(new_data);
            }
           
            request["condition"] = new_conditions;
            request["srvApp"]=item["application"];
            bxRequests.push(request);


            if (bxRequests.length > 0) {
             _self.$confirm(pre_confirm_msg, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "info"
              })
              .then(()=>{
                this.operate(bxRequests).then(response => {
                  var state = response.body.state;
  
                  if ("SUCCESS" == state) {
  
                    var resultMessage = "操作成功!";
  
                    if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                      resultMessage = response.body.resultMessage;
                    }
  
                    this.$message({
                      type: "success",
                      message: resultMessage
                    });
  
                    this.suffix_actions(item);
                    //me.loadTableData();
                  } else {
                    this.$message({
                      type: "error",
                      message: response.body.resultMessage
                    });
                  }
                });
              }).catch(() => {
                this.$message({
                  type: "info",
                  message: "已取消"
                });
              });
              
            }
          // })
          
      }
    },

    /**
     * 自定义删除
     * @param {*} item 
     * @param {*} operateData 
     */
    customize_delete(item, operateData) {
      this.pre_data_handle(item, operateData);
      var me = this;
      var bxRequests = [];
      var operate_params_cfg = item.operate_params;
      if (operateData.length <= 0 && operate_params_cfg != undefined && operate_params_cfg != "" && operate_params_cfg != null) {
        this.$alert("请选择操作数据", "提示", {
          confirmButtonText: "确定"
        });
      } else {
        var pre_confirm_msg = item["pre_confirm_msg"];
        if (pre_confirm_msg == "" || pre_confirm_msg == undefined || pre_confirm_msg == null) {
          pre_confirm_msg = "你确定要进行此操作?";
        }
        this.$confirm(pre_confirm_msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {
            var request = {};
            var requestData = [];

            request["serviceName"] = item["operate_service"];
          
            var requestCondition = [];

            // var operate_params = JSON.parse(item["operate_params"]);
            // var condition = operate_params["condition"];

            var packageData = this.getPackageData(item, operateData);
            var new_data = packageData["data"];
            var new_conditions = packageData["conditions"];

            if(JSON.stringify(new_data)=="{}"){
            }else{
              request["data"] = [new_data];
            }
            
            request["condition"] = new_conditions;
            request["srvApp"]=item["application"];
            bxRequests.push(request);

            if (bxRequests.length > 0) {
              this.operate(bxRequests).then(response => {
                var state = response.body.state;

                if ("SUCCESS" == state) {

                  var resultMessage = "操作成功!";

                  if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                    resultMessage = response.body.resultMessage;
                  }

                  this.$message({
                    type: "success",
                    message: resultMessage
                  });

                  this.suffix_actions(item);
                } else {
                  this.$message({
                    type: "error",
                    message: response.body.resultMessage
                  });
                }
              });
            }
          })
          .catch((e) => {
            
            this.$message({
              type: "info",
              message: "已取消"
            });
          });
      }
    },


  }
};
