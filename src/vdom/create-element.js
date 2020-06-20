export function createTextVNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
}
export function createElement(tag, data = {}, ...children) {
    // vue中的key 不会作为属性传递给组件

    
    return vnode(tag, data, data.key, children)
}
// 虚拟节点是 产生一个对象 用来描述dom结构 增加自定义属性
// ast 他是描述 dom语法的 
function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text,
    }
}