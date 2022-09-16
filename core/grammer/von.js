import { getValue } from "../util/objectUtil.js";
import VNode from "../vdom/vnode.js";

/**
 * 
 * @param {Due} vm 
 * @param {VNode} vnode 
 */
export function von(vm,vnode){
  if (vnode.nodeType !== 1) return;
  let attrNames = vnode.elm.getAttributeNames();
  for (let i = 0; i < attrNames.length; i++) {
    const attrName = attrNames[i];
    
    if (attrName.indexOf('v-on:') === 0 || attrName.indexOf('@') === 0) {
      console.log(attrName)
      checkVon(vm, vnode, attrName.split(':')[1] || attrName.split('@')[1], vnode.elm.getAttribute(attrName));
    }
  }
}

/**
 * 设置von对应的 事件
 * @param {Due} vm 
 * @param {VNode} vnode 
 * @param {string} event 事件名 
 * @param {string} handle 处理函数的名称
 */
function checkVon(vm,vnode,event,handle){
  let method = getValue(vm._methods,handle);
  console.log(method,event)
  if(method){
    vnode.elm.addEventListener(event,()=> method.call(vm));
  }
}
