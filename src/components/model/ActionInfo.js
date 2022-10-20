import _ from "lodash"

export class ActionInfo {

  constructor(e,type) {
    let self = this
    this.name = "xx";
    this.label = "xx";
    this.seq = 0;
    this.visible = "true";
    this.delay = 0;
    this.disableExpr = "false";
    this.formSubmit = false;
    this.skipPermission = false;
    this.permissionService = "unknown";

    this.confirm = null;
    // if null, use resultMessage from backend
    this.completeTip = null;
    this.loading = true;
    this.draftConfig = false // 是否有保存草稿配置
    // action 完成后跳转的 router Location 对象
    this.nav2Location = null;

    // 主要组成
    this.precheckFunc = null;
    this.customPrecheckFunc = null;
    this.executor = null;
    this.invokeFunc = null;
    // 自定义属性
    this.operate_params = e ? e.operate_params : null
    this.operate_service = e ? e.operate_service : null
    this.servcie_type = e ? e.servcie_type : null
    this.suffix_actions = e ? e.suffix_actions : null
    
    /**
   * 处理自定义按钮 风格
   */
  let buttonStyle = {
    "grid":{
      "type": "primary", 
      "style":"", 
      "size":"small", 
      "icon":""
    },
    "row":{
      "type": "plain", 
      "style":"", 
      "size":"mini", 
      "icon":""
    },
    "form":{
      "type": "primary", 
      "style":"", 
      "size":"mini", 
      "icon":""
    }
  }
  let extend = null
  if(type &&e.more_config &&  e.more_config !== null && e.more_config !== undefined){
    
    extend = JSON.parse(e.more_config)
    if(type === "grid"){
      this._moreConfig = buttonStyle.grid
    }else if(type === "form"){
      this._moreConfig = buttonStyle.form
    }else if(type === "row"){
      this._moreConfig = buttonStyle.row
    }
  }else{
    this._moreConfig = buttonStyle.grid
  }
  
  if(extend && extend !== null && extend !== undefined){
    try {
      this._moreConfig.type = extend.type ? extend.type : this._moreConfig.type
      this._moreConfig.style = extend.style ? extend.style : this._moreConfig.style
      this._moreConfig.size = extend.size ? extend.size : this._moreConfig.size
      this._moreConfig.icon = extend.icon ? extend.icon : this._moreConfig.icon
      if(extend.hasOwnProperty('draft')) this._moreConfig.draft = extend.draft
      if(extend.hasOwnProperty('auto_save')) this._moreConfig.auto_save = extend.auto_save
      this._moreConfig.isCheck = extend.isCheck
    } catch (error) {
      
    }
  }
    this.visibleFunc = () => {
      if (_.isString(self.visible)) {
        try {
          return eval(self.visible)
        } catch (e) {
          return true
        }
      } else {
        return !!self.visible
      }
    }
  }
}