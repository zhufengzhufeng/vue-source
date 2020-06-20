export function patch(oldVnode, newVnode) {
    const isRealElement = oldVnode.nodeType;
    if (isRealElement) {
        // 真实元素
        const oldElm = oldVnode;
        const parentElm = oldElm.parentNode;
        let el = createElm(newVnode);
        parentElm.insertBefore(el, oldElm.nextSibling)
        parentElm.removeChild(oldElm);
        return el; // 渲染的真实dom
    } else {
        // dom diff 算法  同层比较 （默认想完整比对一棵树 O(n^3)）  O(n)
        // 不需要跨级比较

        // 两棵树 要先比较树根一不一样，再去比儿子长的是否一样

        if (oldVnode.tag !== newVnode.tag) { // 标签名不一致 说明是两个不一样的节点
            oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el);
        }
        // 标签一致 div  都是文本 tag = undefined

        if (!oldVnode.tag) { // 如果是文本 文本变化了 直接用新的文本替换掉老的文本
            if (oldVnode.text !== newVnode.text) {
                oldVnode.el.textContent = newVnode.text;
            }
        }
        // 一定是标签了 而且标签一致
        // 需要复用老的节点 替换掉老的属性
        let el = newVnode.el = oldVnode.el;
        // 更新属性  diff 属性
        updateProperties(newVnode, oldVnode.data); // 此时属性就更新完毕了 当前的树根已经完成了

        // 比对孩子节点
        let oldChildren = oldVnode.children || []; // 老的孩子
        let newChildren = newVnode.children || []; // 新的孩子

        // 新老都有孩子 那就比较 diff核心
        // 老的有孩子 新的没孩子 直接删除
        // 新的有孩子  老的没孩子 直接插入

        if (oldChildren.length > 0 && newChildren.length > 0) {
            // diff  两个人都有儿子 ** 这里要不停的去比较孩子节点
            updateChildren(el, oldChildren, newChildren);
            // 通过比较老孩子和新孩子 操作el中的儿子

        } else if (oldChildren.length > 0) {
            el.innerHTML = '';
        } else if (newChildren.length > 0) {
            for (let i = 0; i < newChildren.length; i++) {
                let child = newChildren[i]; // 拿到一个个的孩子
                el.appendChild(createElm(child)); // 浏览器会自动优化
            }
        }
        return el;
    }
}

function isSameVnode(oldVnode, newVnode) {
    return (oldVnode.key == newVnode.key) && (oldVnode.tag === newVnode.tag);
}

function updateChildren(parent, oldChildren, newChildren) {
    // Vue2.0 使用双指针的方式 来进行比对
    // v-for 要有key  key可以标识元素 是否发生变化 前后的key相同则可以复用这个元素

    let oldStartIndex = 0; // 老的开始的索引
    let oldStartVnode = oldChildren[0]; // 老的开始
    let oldEndIndex = oldChildren.length - 1; // 老的尾部索引
    let oldEndVnode = oldChildren[oldEndIndex]; // 获取老的孩子的最后一个

    let newStartIndex = 0; // 老的开始的索引
    let newStartVnode = newChildren[0]; // 老的开始
    let newEndIndex = newChildren.length - 1; // 老的尾部索引
    let newEndVnode = newChildren[newEndIndex]; // 获取老的孩子的最后一个

    function makeIndexByKey(children) { // 只需要创建一次 映射表
        let map = {};
        children.forEach((item, index) => {
            map[item.key] = index;
        })
        return map
    }
    let map = makeIndexByKey(oldChildren); // 根据老的孩子的key 创建一个映射表 
    // 1方案1 先开始从头部进行比较  O(n)  优化向后插入的逻辑
    // 比较时 就是采用最短的进行比较，剩下的要不是删除要么是增加
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 如何判断 两个虚拟节点是否一致 就是用key + type 进行判断
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            //标签和key一致 但是 元素可能属性不一致
            patch(oldStartVnode, newStartVnode); //自身属性 +  递归比较
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
            //  指针不停的在动
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // 2 方案2  从尾部开始比较 如果头部不一致 开始尾部比较， 优化向前插入
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex]; // 移动尾部指针
            newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 正序  和 倒叙  reverst sort
            // 3方案3 头不一样 尾不一样  头移尾  倒序操作
            patch(oldStartVnode, newEndVnode);
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 具备移动性
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 老的尾 和新的头比对
            patch(oldEndVnode, newStartVnode);
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        } else {
            // 乱序比对  最终处理
            let moveIndex = map[newStartVnode.key];
            if (moveIndex == undefined) { // 是一个新元素 ，应该添加进去
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else {
                let moveVnode = oldChildren[moveIndex];
                oldChildren[moveIndex] = null; // 占位 如果直接删除 可能会导致数组塌陷  [a,b,null,d]

                // 比对当前这两个元素属性和儿子
                patch(moveVnode, newStartVnode);
                parent.insertBefore(moveVnode.el, oldStartVnode.el);
            }
            newStartVnode = newChildren[++newStartIndex]; // 移动新的指针
        }

    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // appendChild   =  insertBefore null  js原生操作
            let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
            parent.insertBefore(createElm(newChildren[i]), ele);
            // parent.appendChild(createElm(newChildren[i]))
        }
    }
    if (oldStartIndex <= oldEndIndex) { // 说明新的已经循环完毕了 老的有剩余 剩余就是不要的
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldChildren[i];
            if (child != null) {
                parent.removeChild(child.el);
            }
        }
    }

    // 没有key 就直接比较类型，如果类型一样就复用 （隐藏的问题是儿子可能都需要重新创建）
    // 循环时尽量采用唯一的标识 作为key 如果用索引（例如倒叙 会采用索引来复用，不够准确） 如果是静态数据 （你爱用啥用啥）


    // 下周六 开班第一天 

}
export function createElm(vnode) { // 需要递归创建
    let { tag, children, data, key, text } = vnode;
    if (typeof tag == 'string') {
        // 元素 // 将虚拟节点和真实节点做一个映射关系 （后面diff时如果元素相同直接复用老元素 ）
        vnode.el = document.createElement(tag);
        updateProperties(vnode); // 跟新元素属性
        children.forEach(child => {
            // 递归渲染子节点 将子节点 渲染到父节点中
            vnode.el.appendChild(createElm(child));
        });
    } else {
        // 普通的文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}

function updateProperties(vnode, oldProps = {}) {

    // 需要比较 vnode.data 和 oldProps的差异

    let el = vnode.el;
    let newProps = vnode.data || {};
    // 获取老的样式和新的样式的差异 如果新的上面丢失了属性 应该在老的元素上删除掉
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};

    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''; // 删除之前的样式
        }
    }
    for (let key in oldProps) {
        if (!newProps[key]) { // 此时的元素一是以前
            el.removeAttribute(key);
        }
    }

    // 其他情况直接用新的值覆盖掉老的值即可
    for (let key in newProps) {
        if (key == 'style') {
            for (let styleName in newProps.style) { // {color:red,background:green}
                el.style[styleName] = newProps.style[styleName]
            }
            // 浏览器重新渲染也会看值是否变化
        }
        // event 
        else {
            el.setAttribute(key, newProps[key]);
        }
    }
}