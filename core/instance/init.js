import { mount } from "./mount.js";
import { constructorProxy } from "./proxy.js";

let uid = 0;
/**
 * 初始化函数
 * @param {Due} Due 
 */
function initMixin(Due) {
  Due.prototype._init = function (options) {
    const vm = this;
    vm.uid = uid++; //每个实例都有一个唯一编号
    vm._isDue = true; //是否是Due实例
    // 初始化data
    if (options && options.data) {
      vm._data = constructorProxy(vm, options.data, '');
    }
    // 生命周期函数 created
    if(options && options.created){
      vm._created = options.created;
    }
    // 初始化methods
    if(options && options.methods){
      vm._methods = options.methods;
      for (const prop in options.methods) {
        if (Object.hasOwnProperty.call(options.methods, prop)) {
          const value = options.methods[prop];
          vm[prop] = value;
        }
      }
    }
    // 初始化computed
    if(options && options.computed){
      vm._computed = options.computed;
    }
    // mount
    if(options && options.el){
      const rootNode = document.getElementById(options.el);
      mount(vm,rootNode);
    }
    // 生命周期函数 mounted
    if(options && options.mounted){
      vm._mounted = options.mounted;
    }
  }
}

export default initMixin;

