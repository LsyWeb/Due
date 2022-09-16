import VNode from "../vdom/vnode.js";

/**
 * 获取obj中的 属性 为 name 的属性值，name 可能会是 key.a 的形式
 * @param {object} obj 
 * @param {string} name 
 * @returns 
 */
export function getValue(obj, name) {
  if (!obj) {
    return obj;
  }
  let nameList = name.split('.');
  const prop = nameList[0];
  if (obj[prop] !== undefined && obj[name] !== undefined) {
    return obj[prop];
  } else {
    return getValue(obj[prop], name.split(`${prop}.`)[1]);
  }

}

/**
 * 设置 obj 中的 属性为 name 的属性
 * @param {object} obj 
 * @param {string} name 
 * @param {string|number} value 
 */
export function setValue(obj, name, value) {
  if (!obj) {
    return;
  }
  let nameList = name.split('.');
  const prop = nameList[0];
  if (obj[name] !== undefined) {
    return obj[prop] = value;
  } else {
    return setValue(obj[prop], name.split(`${prop}.`)[1], value);
  }
}

/**
 * 获取环境变量
 * @param {Due} vm 
 * @param {VNode} vnode 
 */
export function getEnvAttr(vm,vnode){
  let result = Object.assign(vm._data,vnode.env);
  result = Object.assign(result,vm._computed);
  return result;
}