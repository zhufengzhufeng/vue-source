export function patch(oldVnode,newVnode){
    const isRealElement = oldVnode.nodeType;
    if(isRealElement){
        // 真实元素
        const oldElm = oldVnode;
        const parentElm = oldElm.parentNode;
        let el = createElm(newVnode);
        parentElm.insertBefore(el,oldElm.nextSibling)
        parentElm.removeChild(oldElm);
        return el; // 渲染的真实dom
    }else{
        // dom diff 算法
    }
}   
function createElm(vnode){ // 需要递归创建
    let {tag,children,data,key,text} = vnode;
    if(typeof tag == 'string'){
        // 元素 // 将虚拟节点和真实节点做一个映射关系 （后面diff时如果元素相同直接复用老元素 ）
        vnode.el = document.createElement(tag);
        updateProperties(vnode); // 跟新元素属性
        children.forEach(child => {
            // 递归渲染子节点 将子节点 渲染到父节点中
            vnode.el.appendChild(createElm(child)); 
        });
    }else{
        // 普通的文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}
function updateProperties(vnode){
    let el = vnode.el;
    let newProps = vnode.data || {};

    for(let key in newProps){
        if(key == 'style'){
            for(let styleName in newProps.style) { // {color:red,background:green}
                el.style[styleName] = newProps.style[styleName]
            }
        }
        // event 
        else{
            el.setAttribute(key,newProps[key]);
        }
    }
}