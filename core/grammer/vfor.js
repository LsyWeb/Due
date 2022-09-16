import { getValue } from "../util/objectUtil.js";
import VNode from "../vdom/vnode.js";

/**
 * vfor指令初始化
 * @param {Due} vm Due对象
 * @param {Element} elm 节点
 * @param {VNode} parent 祖先元素
 * @param {string} instructions 传递的指令
 */
export function vforInit(vm,elm,parent,instructions) {
  // 创建一个 虚拟dom 节点，并把 虚拟dom节点的 data 属性赋值为 指令中 要循环的那个数组
  const virtualNode = new VNode(elm.nodeName,elm,[],parent,"",0,getVirtualNodeData(instructions)[2]);
  virtualNode.instructions = instructions;//指令
  // 把虚拟的节点 给 删掉 , 把删除的 文本节点 再 加回去，保持结构一致
  parent.elm.removeChild(elm);
  parent.elm.appendChild(document.createTextNode(''));

  const reusltSet = analysisInstructions(vm,instructions,elm,parent);
  // console.log(virtualNode);
  return virtualNode;
}

/**
 * 得到指令数组：['(key)','in','list']
 * @param {string} instructions 
 */
function getVirtualNodeData(instructions){
  
  const insSet = instructions.split(' ');
  if(insSet.length !== 3 || insSet[1] !== 'in'){
    throw new Error('error');
  }
  return insSet;
}

/**
 * 解析指令
 * @param {Due} vm 
 * @param {string} instructions 
 * @param {Element} elm 
 * @param {VNode} parent 
 */
function analysisInstructions(vm,instructions,elm,parent){
  const insSet = getVirtualNodeData(instructions);//获取指令数组
  const dataSet = getValue(vm._data,insSet[2]);//获取循环的数组 的真实数据
  if(!dataSet){
    throw new Error('v-for指令的格式不正确：无法解析数组');
  }
  let resultSet = [];
  for (let i = 0; i < dataSet.length; i++) {
    const data = dataSet[i];
    let tempDom = document.createElement(elm.nodeName);
    tempDom.innerHTML = elm.innerHTML;

    let env = getAnalysisEnv(insSet[0],data,i);//获取局部变量
    tempDom.setAttribute('env',JSON.stringify(env));//把局部变量设置到 dom 中
    parent.elm.appendChild(tempDom);
    resultSet.push(tempDom);
  }
  return resultSet;
}

/**
 * 获取局部变量
 * @param {string} instructions 
 * @param {any} value 
 * @param {number} index 
 */
function getAnalysisEnv(instructions,value,index){
  if(/\([\w\d_$]+\)/.test(instructions)){
    instructions = instructions.trim();
    instructions = instructions.substring(1,instructions.length - 1);
  }
  let keys = instructions.split(',');
  if(keys.length === 0){
    throw new Error('v-for指令的格式不正确')
  }
  let obj = {};
  if(keys.length >= 1){
    obj[keys[0].trim()] = value;
  }
  if(keys.length >= 2){
    obj[keys[1].trim()] = index;
  }
  return obj;
}