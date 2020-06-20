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



// ----------------------diff----------------------------
// diff 是比较两个树的差异 （虚拟dom）  把前后的dom节点渲染成虚拟dom，通过虚拟节点比对,找到差异，更新真实dom节点
import {compileToFunctions} from './compiler/index';
import {createElm,patch} from './vdom/patch'
let vm1 = new Vue({data:{name:'zf'}});
let vm2 = new Vue({data:{name:'jw'}});

let render1 = compileToFunctions(`<div>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
</div>`);
let oldVnode = render1.call(vm1);

let realElement = createElm(oldVnode);
document.body.appendChild(realElement);


let render2 = compileToFunctions(`<div>
    <li key="C">C</li>
    <li key="D">D</li>
    <li key="M">M</li>
    <li key="E">E</li>
</div>`);
let newVnode = render2.call(vm2);
// 没有虚拟dom 和 diff算法时  直接重新渲染 强制重新更新页面（没有复用老的节点），
// diff 算法 而是先不对差异 在进行更新
setTimeout(() => {


    patch(oldVnode,newVnode); // 虚拟节点之间的比对
}, 1000);




export default Vue;