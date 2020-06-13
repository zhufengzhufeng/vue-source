import {parseHTML} from './parser.js'
import {generate} from './generator.js';
export function compileToFunctions(template){
    // console.log(template)
    // 实现模板的编译

    let ast = parseHTML(template);

    // 代码生成
    // template => render 函数

    /**
     * react 
     * render(){ 
        * with(this){
        *  return _c('div',{id:app,style:{color:red}},_c('span',undefined,_v("helloworld"+_s(msg)) ))
        * }
     * }
     * 
     */
    // 核心就是字符串拼接
    let code = generate(ast); // 代码生成 =》 拼接字符串
    
    code = `with(this){ \r\nreturn ${code} \r\n}`;

    let render = new Function(code); // 相当于给字符串变成了函数


    // 注释节点 自闭和标签 事件绑定 @click  class slot插槽

    return render;
    // 模板编译原理 
    // 1.先把我们的代码转化成ast语法树 （1）  parser 解析  (正则)
    // 2.标记静态树  （2） 树得遍历标记 markup  只是优化
    // 3.通过ast产生的语法树 生成 代码 =》 render函数  codegen
}