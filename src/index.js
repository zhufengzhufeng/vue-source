import {initMixin} from './init';
function Vue(options){
    // 内部要进行初始化的操作 
    this._init(options); // 初始化操作
}

initMixin(Vue); // 添加原型的方法
export default Vue;