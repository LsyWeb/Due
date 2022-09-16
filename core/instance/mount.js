import { vbind } from "../grammer/vbind.js";
import { vforInit } from "../grammer/vfor.js";
import { vmodel } from "../grammer/vmodel.js";
import { von } from "../grammer/von.js";
import VNode from "../vdom/vnode.js";
import { clearMap, getTemplate2VNodeMap, getVNode2Templage, getVNodeByTemplate, prepareRnder } from "./render.js";

/**
 * 给Due原型上写一个 $mount 方法
 * @param {Due} Due 
 */
export function initMount(Due) {
  /**
   * 挂载的节点id
   * @param {string} el 
   */
  Due.prototype.$mount = function (el) {
    let rootDom = document.getElementById(el);
    mount(this, rootDom);//挂载
  }
}

/**
 * 把虚拟dom挂载到页面上
 * @param {object} vm 挂载到Due实例
 * @param {Element} elm 挂载到的节点
 */
export function mount(vm, elm) {
  // 进行挂载
  vm._VNode = constructMount(vm, elm, null);
  // 进行预备渲染(建立渲染索引，通过模板找vnode，通过vnode找模板)
  prepareRnder(vm, vm._VNode);
  const template2vnodeMap = getTemplate2VNodeMap();
  const vnode2templateMap = getVNode2Templage();
}

/**
 * 构建 VNode ，使用递归（深度优先遍历）
 * @param {Due} vm Due实例
 * @param {Element} elm 当前节点
 * @param {VNode} parent 祖先节点
 */
function constructMount(vm, elm, parent) {

  let vnode = analysisAttr(vm, elm, parent) || null;// 分析标签节点上的 属性 如：v-model , v-for
  
  if (vnode === null) {
    let tag = elm.nodeName;
    let children = [];
    let text = getNodeText(elm);
    let nodeType = elm.nodeType;
    let data = null;
    //创建vnode实例
    vnode = new VNode(tag, elm, children, parent, text, nodeType, data);
    if (elm.nodeType === 1 && elm.getAttribute('env')) {
      vnode.env = Object.assign(vnode.env,JSON.parse(elm.getAttribute('env')));
    }else{
      vnode.env = Object.assign(vnode.env,(parent ? parent.env : {}))
    }
  }
  
  vbind(vm,vnode);//动态属性绑定
  von(vm,vnode);//绑定事件
  //深度优先遍历
  // 节点的所有子节点  如果 是虚拟节点 则 使用祖先元素的 子节点
  let childs = vnode.nodeType === 0 ? vnode.parent.elm.childNodes : vnode.elm.childNodes;
  for (let i = 0; i < childs.length; i++) {
    const element = childs[i];
    let childNodes = constructMount(vm, element, vnode);
    if (childNodes instanceof VNode) {//返回单一节点
      vnode.children.push(childNodes);
    } else {//返回节点数组
      vnode.children = vnode.children.concat(childNodes);
    }
  }
  return vnode;
}

/**
 * 获取当前节点的文本信息
 * @param {Element} elm 当前节点
 */
function getNodeText(elm) {
  if (elm.nodeType === 3) {//nodeType 为 3 的 节点是 #Text，也就是文本节点
    return elm.textContent;
  } else {
    return '';
  }
}

/**
 * 分析标签节点上面的 属性
 * @param {Due} vm 
 * @param {Element} elm 
 * @param {VNode} parent 
 */
function analysisAttr(vm, elm, parent) {
  if (elm.nodeType === 1) {
    const attrNames = elm.getAttributeNames();
    // v-model指令
    if (attrNames.includes("v-model")) {
      vmodel(vm, elm, elm.getAttribute('v-model'));
    }
    // v-for指令
    if (attrNames.includes('v-for')) {
      return vforInit(vm, elm, parent, elm.getAttribute('v-for'));
    }
  }
}

/**
 * 重新构建节点
 * @param {Due} vm 
 * @param {string} template 模板
 */
export function rebuild(vm,template){
  console.log(template)
  const vnodes = getVNodeByTemplate(template);
  console.log(vnodes)
  if(vnodes){
    for (let i = 0; i < vnodes.length; i++) {
      const vnode = vnodes[i];
      vnode.parent.elm.innerHTML = '';
      vnode.parent.elm.appendChild(vnode.elm);
      let result = constructMount(vm,vnode.elm,vnode.parent);
      vnode.parent.children = [result];
      clearMap();
      prepareRnder(vm,vm._VNode);
    }
  }
}