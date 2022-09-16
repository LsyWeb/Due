/**
 * 根据一个对象 生成代码
 * @param {object} obj 目标对象
 */
export function generateCode(obj){
  let code = "";
  const propertyNames = Object.getOwnPropertyNames(obj);
  for (let i = 0; i < propertyNames.length; i++) {
    const prop = propertyNames[i];
    code += `let ${prop} = ${JSON.stringify(obj[prop])};`
  }
  return code;
}

/**
 * 判断表达式 是否 成立
 * @param {string} expression 表达式
 * @param {string} env 依赖的 环境变量
 * @returns {boolean}
 */
export function isTrue(expression,env){
  let bool = false;
  let code = env;
  code += `if(${expression}){bool = true}`;
  eval(code);
  return bool;
}