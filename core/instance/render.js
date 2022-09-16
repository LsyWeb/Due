import VNode from '../vdom/vnode.js'
import { getValue } from '../util/objectUtil.js'

// 通过模板找节点
let template2vnode = new Map();
// 通过节点找模板
let vnode2template = new Map();

/**
 * 给Due上面添加 _render 方法
 * @param {Due} Due 
 */
export function renderMixin(Due) {
  Due.prototype._render = function () {
    renderNode(this, this._VNode);
  }
}

/**
 * 根据 数据变化 重新渲染页面
 * @param {Due} vm 
 * @param {string} data 
 */
export function renderData(vm, data) {
  const vnodes = template2vnode.get(data);//获取数据对应的节点
  if (vnodes) {
    for (let i = 0; i < vnodes.length; i++) {
      const vnode = vnodes[i];
      renderNode(vm, vnode);
    }
  }
}

/**
 * 渲染当前节点以及子节点
 * @param {Due} vm 
 * @param {VNode} vnode 
 */
export default function renderNode(vm, vnode) {
  if (vnode.nodeType === 3) {// 文本节点，只有文本节点能够渲染
    const templates = vnode2template.get(vnode);//根据节点获取映射的模板
    if (templates) {
      let result = vnode.text;
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        let templateValue = getTemplateValue([vm._data, vnode.env], template);// 拿到模板对应的数据
        if (templateValue !== undefined) {
          result = result.replace('{{' + template + '}}', templateValue);
        }
      }
      vnode.elm.nodeValue = result;
    }

  } else if (vnode.nodeType === 1 && vnode.tag === 'INPUT') {
    const templates = vnode2template.get(vnode);
    if (templates) {
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        let templateValue = getTemplateValue([vm._data, vnode.env], template);
        if (templateValue !== undefined) {
          vnode.elm.value = templateValue;
        }
      }
    }
  }
  else {
    for (let i = 0; i < vnode.children.length; i++) {
      const element = vnode.children[i];
      renderNode(vm, element);
    }
  }
}

/**
 * 获取 响应式数据中 与 模板 对应的 属性值
 * @param {Array<object>} objs 数据数组，可能会来自Due ，也可能会来自 父级节点，比如 v-for 中的 item
 * @param {string} templateName 模板内容 key 、key.a
 */
function getTemplateValue(objs, templateName) {
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i];
    const value = getValue(obj, templateName);
    if (value !== undefined) {
      return value;
    }
  }
  return;
}

/**
 * 预备渲染
 * @param {Due} vm 
 * @param {VNode} vnode 
 * @returns 
 */
export function prepareRnder(vm, vnode) {
  if (vnode === null) return;
  if (vnode.nodeType === 3) {//如果是文本节点
    analysisTemplateString(vnode);
  }
  if (vnode.nodeType === 0) {
    setTemplate2Vnode(vnode.data, vnode);
    setVnode2Template(vnode.data, vnode);
  }
  analysisAttr(vm, vnode);

  for (let i = 0; i < vnode.children.length; i++) {
    const item = vnode.children[i];
    prepareRnder(vm, item);
  }

}

/**
 * 分析模板
 * @param {VNode} vnode 
 */
function analysisTemplateString(vnode) {
  const templateList = vnode.text.match(/{{[a-zA-Z0-9._]+}}/g);
  for (let i = 0; templateList && i < templateList.length; i++) {
    const item = templateList[i];
    setTemplate2Vnode(item, vnode);
    setVnode2Template(item, vnode);
  }
}

/**
 * 根据模板设置节点
 * @param {string} template 
 * @param {VNode} vnode 
 */
function setTemplate2Vnode(template, vnode) {
  const templateCtx = getTemplateCtx(template);//获取模板内容
  let vnodeSet = template2vnode.get(templateCtx);
  if (vnodeSet) {
    vnodeSet.push(vnode);
  } else {
    template2vnode.set(templateCtx, [vnode]);
  }
}

/**
 * 根据节点设置模板
 * @param {string} template 
 * @param {VNode} vnode 
 */
function setVnode2Template(template, vnode) {
  let templateSet = vnode2template.get(vnode);
  if (templateSet) {
    templateSet.push(getTemplateCtx(template));
  } else {
    vnode2template.set(vnode, [getTemplateCtx(template)]);
  }
}
/**
 * 获取模板内容（去掉花括号）
 * @param {string} template 
 */
function getTemplateCtx(template) {
  if (template.substring(0, 2) === '{{'
    && template.substring(template.length - 2, template.length) === '}}'
  ) {
    return template.substring(2, template.length - 2);
  } else {
    return template;
  }
}

/**
 * 获取模板到节点的映射
 * @returns {Map}
 */
export function getTemplate2VNodeMap() {
  return template2vnode;
}

/**
 * 获取节点到模板的映射
 * @returns {Map}
 */
export function getVNode2Templage() {
  return vnode2template;
}

/**
 * 分析标签节点的属性
 * @param {Due} vm Due对象
 * @param {VNode} vnode 虚拟节点
 */
function analysisAttr(vm, vnode) {
  if (vnode.nodeType !== 1) {
    return;
  }
  const attrNames = vnode.elm.getAttributeNames();//获取 标签 属性列表
  if (attrNames.includes('v-model')) {//判断属性列表里面是否有 v-model 的属性
    setTemplate2Vnode(vnode.elm.getAttribute('v-model'), vnode);
    setVnode2Template(vnode.elm.getAttribute('v-model'), vnode);
  }
}

/**
 * 清空 模板 和 节点 的映射
 */
export function clearMap() {
  template2vnode.clear();
  vnode2template.clear();
}

/**
 * 根据模板获取 对应的节点
 * @param {string} template 
 * @returns {Array<VNode>}
 */
export function getVNodeByTemplate(template) {
  console.log(vnode2template,template)
  return template2vnode.get(template);
}