import { rebuild } from "./mount.js";
import { renderData } from "./render.js";

/**
 * 重写数组中的方法
 * @param {object} obj 要代理的对象
 * @param {string} func 要代理的方法名称
 * @param {string} namespace 命名空间
 * @param {object} vm Due对象
 */
function defineArrayProxy(obj, func, namespace, vm) {
  const ArrayProto = Array.prototype;
  Object.defineProperty(obj, func, {
    enumerable: true,
    configurable: true,
    value(...args) {
      const origin = ArrayProto[func];// 使用的还是数组原型上的方法，只是会做一些其他操作
      const result = origin.apply(this, args);
      rebuild(vm,getNameSpace(namespace,""));//重新构建节点
      renderData(vm,getNameSpace(namespace,""));
      return result;
    }
  })
}

/**
 * 代理数组，监听数组的变化
 * @param {object} vm 
 * @param {Array} arr 
 * @param {string} namespace 
 */
function proxyArr(vm, arr, namespace) {
  let obj = {
    eleType: 'Array',
    toString() {
      let result = '';
      for (let i = 0; i < arr.length; i++) {
        result += ', ';
      }
      return result.substring(0, result.length - 2)
    },
    // 下面要重写数组中可能会**导致数组发生变化**的方法
    push() { },
    pop() { },
    shift() { },
    unshift() { },
  }
  defineArrayProxy.apply(vm, [obj, 'push', namespace, vm]);
  defineArrayProxy.apply(vm, [obj, 'pop', namespace, vm]);
  defineArrayProxy.apply(vm, [obj, 'shift', namespace, vm]);
  defineArrayProxy.apply(vm, [obj, 'unshift', namespace, vm]);
  arr.__proto__ = obj; //需要把数组的 **隐式原型** 赋值为 *obj* ，这样，再使用数组中的方法就使用的是已经 **重写** 过的方法
  return arr;//最后，把 重写 过方法的数组返回 
}

/**
 * 使用代理监听属性变化
 * @param {object} vm Due对象
 * @param {object} obj 要进行代理的对象
 * @param {string} namespace 命名空间
 */
function constructObjectProxy(vm, obj, namespace) {
  let proxyObj = {};//创建代理对象

  for (const prop in obj) {
    // 监听obj上的属性
    Object.defineProperty(proxyObj, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set(value) {
        obj[prop] = value;
        renderData(vm,getNameSpace(namespace, prop)); //渲染页面
      }
    })
    // 监听Due实例上的属性
    Object.defineProperty(vm, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set(value) {
        obj[prop] = value;
        renderData(vm,getNameSpace(namespace, prop)); //渲染页面
      }
    })
    if (obj[prop] instanceof Object) {
      proxyObj[prop] = constructorProxy(vm, obj[prop], getNameSpace(namespace, prop))
    }
  }
  return proxyObj;
}

/**
 * 对obj进行代理
 * @param {object} vm Due对象
 * @param {object} obj 要进行代理的对象
 * @param {string} namespace 命名空间
 */
export function constructorProxy(vm, obj, namespace) {
  let proxyObj = null; //创建代理对象
  if (obj instanceof Array) { //代理的数据是数组
    proxyObj = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      if (proxyObj[i] instanceof Object) {//如果数组里的元素是对象，则继续代理，如果数组里的值是原始值，则不做任何处理
        proxyObj[i] = constructorProxy(vm, obj[i], namespace);//代理数组中的对象
      }
    }
    proxyObj = proxyArr(vm, obj, namespace); //代理数组，监听数据的变化
  } else if (obj instanceof Object) { //代理的数据是对象
    proxyObj = constructObjectProxy(vm, obj, namespace); //使用代理监听对象的属性变化
  } else {
    throw ('data type is not Object');
  }
  return proxyObj; //最后返回代理对象
}

/**
 * 获取当前位置的命名空间
 * @param {string} namespace 
 * @param {string} nowProp 
 * @returns 
 */
function getNameSpace(namespace, nowProp) {
  if (namespace === null || namespace === "") {
    return nowProp;
  } else if (nowProp === null || nowProp === "") {
    return namespace;
  } else {
    return `${namespace}.${nowProp}`;
  }
}