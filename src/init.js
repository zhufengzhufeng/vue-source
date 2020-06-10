import { initState } from './state';
import {compileToFunctions} from './compiler/index.js'
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        // Vue的内部 $options 就是用户传递的所有参数
        const vm = this;
        vm.$options = options; // 用户传入的参数
        initState(vm); // 初始化状态
        // 需要通过模板进行渲染
        if (vm.$options.el) { // 用户传入了el属性
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function (el) { // 可能是字符串 也可以传入一个dom对象
        const vm = this;
        el = document.querySelector(el); // 获取el属性

        // 如果同时传入 template 和render  默认会采用render 抛弃template，如果都没传就使用id="app"中的模板
        const opts = vm.$options;

        if(!opts.render){
            let template = opts.template;
            if(!template && el){ // 应该使用外部的模板
                template = el.outerHTML;
            }
            const render = compileToFunctions(template);
            opts.render = render;
        }
        // 走到这里说明不需要编译了 ，因为用户传入的就是 一个render函数
        
        opts.render;
    }

}