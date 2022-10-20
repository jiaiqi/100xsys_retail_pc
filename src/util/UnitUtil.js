export function getUnitData(value, header) {   
  let srvcol = header.srvcol || {};
  let more_config = srvcol.more_config || null;
  if(more_config){
    more_config = JSON.parse(more_config);
    let changJson = {
      dataSize: {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024
      },
      lenth: {
        MM: 1,
        CM: 10,
        M: 10*100,
        KM: 10*100*1000
      },
    }
    let unitC = more_config.unitC;
    if(!unitC){
      return value;
    }
    let unit = changJson[ unitC.unit ];
    switch(unitC.unit){
      case "dataSize":
        value = dataSize(value,unit,unitC.beforeUnit,unitC.afterUnit);
        break;
      case "lenth":
        value = lenth(value,unit[unitC.beforeUnit],unit[unitC.afterUnit],unitC.beforeUnit,unitC.afterUnit);
        break;
    }
    return value; 
  } else {
      return value;
  }   
};
function dataSize(value,unit,beforeUnit,afterUnit){
  var beforeUnitNum = unit[beforeUnit];
  var afterUnitNum =  unit[afterUnit];
  var i = value * (beforeUnitNum / afterUnitNum);
  if(0==i){
    value = value + afterUnit;
  }else if(0.1>i){
    // afterUnit = findSuitDataUnit();
    // afterUnitNum =  unit[afterUnit];
    // value = (value * beforeUnitNum / afterUnitNum) ;
    // value = Math.round(value*100)/100 + afterUnit;
    value = value + beforeUnit;
  }else{
    value = (value * beforeUnitNum / afterUnitNum) ;
    value = Math.round(value*100)/100 + afterUnit;
  }
  return value;
}
//查询合适数据单位
function findSuitDataUnit(value,beforeUnit,afterUnit,unit){

  var beforeUnitNum = unit[beforeUnit];
  var afterUnitNum =  unit[afterUnit];
  if(beforeUnit==afterUnit){
    return afterUnit;
  }else{
    value = value * (beforeUnitNum / afterUnitNum);
    if(value<0.1){
      if("TB" == afterUnit){
        afterUnit = "GB";
      }else if ("GB" == afterUnit){
        afterUnit = "MB";
      }else if ("MB" == afterUnit){
        afterUnit = "KB";
      }else if ("KB" == afterUnit){
        afterUnit = "B";
      }
      findSuitDataUnit(value,beforeUnit,afterUnit,unit);
    }else{
      return afterUnit;
    }
  }
}

function lenth(value,beforeUnitNum,afterUnitNum,beforeUnit,afterUnit){
  var i = value * (beforeUnitNum / afterUnitNum);
  if(0==i){
    value = value + afterUnit;
  }else if(0.1>i){
    value = value + beforeUnit;
  }else{
    value = (value * beforeUnitNum / afterUnitNum) ;
    value = Math.round(value*100)/100 + afterUnit
  }
  return value;
}