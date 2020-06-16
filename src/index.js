import {initMixin} from './init';
import {renderMixin} from './render.js';
import {lifeCycleMixin} from './lifecycle';
import {initGlobalAPI} from './global-api/index.js'
import { nextTick } from './observer/scheduler';
function Vue(options){
    // 内部要进行初始化的操作 
    this._init(options); // 初始化操作
}

initMixin(Vue); // 添加原型的方法
renderMixin(Vue);
lifeCycleMixin(Vue);


// initGlobalApi 给构造函数来扩展全局的方法
initGlobalAPI(Vue);



Vue.prototype.$nextTick = nextTick

export default Vue;