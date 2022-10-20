<template >
  <!-- <div
          @dragstart.prevent
          :class="[
      'el-input-number',
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]">
    
  </div> -->
  <el-input
            ref="input"
            v-model="currentValue"
            :disabled="inputNumberDisabled"
            :size="inputNumberSize"
            :max="max"
            :min="min"
            :name="name"
            :label="label"
            clearable
            :placeholder="fieldMoreConfig.placeholder"
            @keydown.up.native.prevent="increase"
            @keydown.down.native.prevent="decrease"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInputChange">
            <template slot="append" v-if="fieldMoreConfig.moreConfig && fieldMoreConfig.moreConfig.appendText">{{fieldMoreConfig.moreConfig.appendText}}</template>
                <template slot="prepend" v-if="fieldMoreConfig.moreConfig && fieldMoreConfig.moreConfig.prependText">{{fieldMoreConfig.moreConfig.prependText}}</template>
    </el-input>
</template>
<script>
  import ElInput from 'element-ui/packages/input';
  import Focus from 'element-ui/src/mixins/focus';
  import RepeatClick from 'element-ui/src/directives/repeat-click';

  export default {
    name: 'BxInputNumber',
    mixins: [Focus('input')],
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },
    directives: {
      repeatClick: RepeatClick
    },
    components: {
      ElInput
    },


    props: {
      step: {
        type: Number,
        default: 1
      },
      fieldMoreConfig:null,
      max: {
        type: Number,
        default: Infinity
      },
      min: {
        type: Number,
        default: -Infinity
      },
      value: {},
      disabled: Boolean,
      size: String,
      controls: {
        type: Boolean,
        default: true
      },
      controlsPosition: {
        type: String,
        default: ''
      },
      name: String,
      label: String,
      precision: {
        type: Number,
        validator(val) {
          return val >= 0 && val === parseInt(val, 10);
        }
      }
    },
    data() {
      return {
        // the raw value bind to input
        currentValue: null,
      };
    },
    watch: {
      value: {
        immediate: true,

        handler(value) {
          let newVal = (value === undefined || value === null) ? value : Number(value);
          if (newVal !== undefined && value !== null) {
            if (isNaN(newVal)) {
              return;
            }
            if (this.precision !== undefined) {
              newVal = this.toPrecision(newVal, this.precision);
            }
          }
          if (newVal != null && newVal != undefined) {
            if (newVal >= this.max) newVal = this.max;
            if (newVal <= this.min) newVal = this.min;
          }
          this.currentValue = newVal;
          this.$emit('input', newVal);
        }
      }
    },
    computed: {
      minDisabled() {
        return this._decrease(this.value, this.step) < this.min;
      },
      maxDisabled() {
        return this._increase(this.value, this.step) > this.max;
      },
      numPrecision() {
        const {value, step, getPrecision, precision} = this;
        const stepPrecision = getPrecision(step);
        if (precision !== undefined && precision !== null) {
          
          return precision;
        } else {
          return Math.max(getPrecision(value), stepPrecision);
        }
      },
      controlsAtRight() {
        return this.controlsPosition === 'right';
      },
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      inputNumberSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      inputNumberDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      currentInputValue() {
        const currentValue = this.currentValue;
        if (typeof currentValue === 'number' && this.precision !== undefined && this.precision !== null) {
          return currentValue.toFixed(this.precision);
        } else {
          return currentValue;
        }
      }
    },
    methods: {
      toPrecision(num, precision) {
        if (precision === undefined || precision === null) precision = this.numPrecision;
        return parseFloat(parseFloat(Number(num).toFixed(precision)));
      },
      getPrecision(value) {
        if (value === undefined || value == null) return 0;
        const valueString = value.toString();
        const dotPosition = valueString.indexOf('.');
        let precision = 0;
        if (dotPosition !== -1) {
          precision = valueString.length - dotPosition - 1;
        }
        return precision;
      },
      _increase(val, step) {
        if (typeof val !== 'number' && val !== undefined && val !== null) return this.currentValue;

        const precisionFactor = Math.pow(10, this.numPrecision);
        // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
        return this.toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
      },
      _decrease(val, step) {
        if (typeof val !== 'number' && val !== undefined && val !== null) return this.currentValue;

        const precisionFactor = Math.pow(10, this.numPrecision);

        return this.toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
      },
      increase() {
        if (this.inputNumberDisabled || this.maxDisabled) return;
        const value = this.value || 0;
        const newVal = this._increase(value, this.step);
        this.setCurrentValue(newVal);
      },
      decrease() {
        if (this.inputNumberDisabled || this.minDisabled) return;
        const value = this.value || 0;
        const newVal = this._decrease(value, this.step);
        this.setCurrentValue(newVal);
      },
      handleBlur(event) {
        this.$emit('blur', event);
      },
      handleFocus(event) {
        this.$emit('focus', event);
      },
      setCurrentValue(newVal) {
        const oldVal = this.currentValue;
        if (typeof newVal === 'number' && this.precision !== undefined && this.precision !== null) {
          newVal = this.toPrecision(newVal, this.precision);
        }
        if (newVal != null && newVal != undefined) {
          if (newVal >= this.max) newVal = this.max;
          if (newVal <= this.min) newVal = this.min;
        }

        if (oldVal === newVal) {
          return;
        }
        this.$emit('input', newVal);
        this.$emit('change', newVal, oldVal);
        this.currentValue = newVal;
      },

      handleInputChange(value) {
        const newVal = value === '' ? undefined : Number(value);
        if (isNaN(newVal) && !(newVal === undefined || newVal === null)) {
          // reset to old value
          this.setCurrentValue(this.value);
        } else if (newVal === '' || newVal === undefined || newVal === null) {
          // empty
          this.currentValue = ""

          this.$emit('input', null);
        } else {
          // happy
          this.$emit('input', newVal);
        }

        this.$emit("change", newVal);
      }
    },
    mounted() {
      let innerInput = this.$refs.input.$refs.input;
      innerInput.setAttribute('role', 'spinbutton');
      innerInput.setAttribute('aria-valuemax', this.max);
      innerInput.setAttribute('aria-valuemin', this.min);
      innerInput.setAttribute('aria-valuenow', this.currentValue);
      innerInput.setAttribute('aria-disabled', this.inputNumberDisabled);
    },
    updated() {
      if (!this.$refs || !this.$refs.input) return;
      const innerInput = this.$refs.input.$refs.input;
      innerInput.setAttribute('aria-valuenow', this.currentValue);
    }
  };
</script>
