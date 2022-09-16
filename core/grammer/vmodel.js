import { setValue } from "../util/objectUtil.js"

/**
 * 完成数据双向绑定
 * @param {Due} vm 
 * @param {HTMLInputElement} elm 
 * @param {string} data 
 */
export function vmodel(vm,elm,data){
  elm.oninput = function (e){
    setValue(vm._data,data,elm.value);
  }
}