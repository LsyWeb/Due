import initMixin from "./init.js";
import { renderMixin } from "./render.js";

/**
 * Due构造函数
 * @param {object} options 
 */
function Due (options){
  this._init(options);
  this._created && this._created();
  this._render();
  this._mounted && this._mounted();
}

initMixin(Due);
renderMixin(Due);

export default Due;