import * as DataUtil from "../../util/DataUtil";
import {formatMoney} from "../../util/DataUtil";


export class InlineForm {

  constructor(fieldsMap, modelDecorator) {
    this.fields = fieldsMap;
    this.modelDecorator = modelDecorator;
  }


  srvValFormModel() {
    let model = {};

    for (let key in this.fields) {
      model[key] = this.fields[key].getSrvVal();
    }

    if (this.modelDecorator) {
      let decorator = this.modelDecorator;
      decorator(model);
    }

    return model;
  }


}
