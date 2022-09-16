import { generateCode, isTrue } from "../util/code.js";
import { getEnvAttr, getValue } from "../util/objectUtil.js";
import VNode from "../vdom/vnode.js";

/**
 * 动态属性绑定
 * @param {Due} vm 
 * @param {VNode} vnode 
 */
export function vbind(vm, vnode) {
  if (vnode.nodeType !== 1) return;
  let attrNames = vnode.elm.getAttributeNames();
  for (let i = 0; i < attrNames.length; i++) {
    const attrName = attrNames[i];
    if (attrName.indexOf('v-bind:') === 0 || attrName.indexOf(':') === 0) {
      checkVbind(vm, vnode, attrName, vnode.elm.getAttribute(attrName));
    }
  }
}
/**
 * 给含有 v-bind 的标签，设置对应的属性
 * @param {Due} vm 
 * @param {VNode} vnode 
 * @param {string} name 
 * @param {string} value 
 */
function checkVbind(vm, vnode, name, value) {
  let k = name.split(':')[1];
  if (/^\{[\w\W]+\}$/.test(value)) {//判断属性值中 是否 含有 {} ，也就是 class="{red:a < 2}"
    const str = value.substring(1,value.length - 1).trim();
    const expressionList = str.split(','); //以逗号分隔
    let result = analysisExpression(vm,vnode,expressionList);
    vnode.elm.setAttribute(k,result);//添加属性 并且赋值为 对应的数据
  } else {
    let v = getValue(vm._data, value);
    vnode.elm.setAttribute(k, v);//添加属性 并且赋值为 对应的数据
  }
  vnode.elm.removeAttribute(name);//删除原来的v-bind属性
}

/**
 * 分析表达式
 * @param {Due} vm 
 * @param {VNode} vnode 
 * @param {Array<string>} expressionList 
 */
function analysisExpression(vm,vnode,expressionList){
  // 获取环境变量
  const attr = getEnvAttr(vm,vnode);
  // 判断表达式是否成立
  const envCode = generateCode(attr);//根据环境变量 生成 代码：{a:1,b:2} => "let a = 1; let b:2;"
  let result = '';
  for (let i = 0; i < expressionList.length; i++) {
    const expression = expressionList[i];
    let site = expression.indexOf(':');
    if(site > -1){
      let code = expression.substring(site + 1,expression.length);
      // 结合环境变量，判断表达式是否成立
      if(isTrue(code,envCode)){
        result += expression.substring(0,site);
      }
    }else{
      result = expression + ' ';
    }
  }
  return result;
}