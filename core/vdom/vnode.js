/**
 * VNode类，虚拟Dom节点
 */
export default class VNode {
  
  /**
   * 构造函数
   * @param {string} tag 标签类型 Div、Input、#Text
   * @param {Element} elm 对应的真实节点
   * @param {Array<VNode>} children 当前节点下的子节点
   * @param {VNode} parent 当前节点的父级节点
   * @param {string} text 当前节点中的文本
   * @param {string} nodeType 节点类型
   * @param {any} data 暂无意义，作为保留字段
   */
  constructor(tag,elm,children,parent,text,nodeType,data){
    this.tag = tag;
    this.elm = elm;
    this.children = children;
    this.parent = parent;
    this.text = text;
    this.data = data;
    this.nodeType = nodeType;
    this.env = {}; //当前节点的环境变量
    this.instructions = null; //存放的指令
    this.template = []; //当前节点涉及到的模板
  }

  
}