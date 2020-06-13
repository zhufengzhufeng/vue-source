import {initMixin} from './init';
import {renderMixin} from './render.js'
import {lifeCycleMixin} from './lifecycle'
function Vue(options){
    // 内部要进行初始化的操作 
    this._init(options); // 初始化操作
}

initMixin(Vue); // 添加原型的方法
renderMixin(Vue);
lifeCycleMixin(Vue);



export default Vue;