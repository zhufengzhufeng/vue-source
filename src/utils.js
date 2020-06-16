// 此处放所有的工具方法


export function isObject(obj) {
    return typeof obj === 'object' && obj !== null
}
const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'mounted',
    'beforeUpdate',
    'updated'
]
let strats = {};
function mergeHook(parentVal,childVal){ // []
    if(childVal){ // 如果 孩子有值 
        if(parentVal){ // 父亲有值 就直接拼接
            return parentVal.concat(childVal)
        }else{ // 如果孩子有值父亲没值 就将孩子包装成数组
            return [childVal] // Vue.options.beforeCreate = [childVal]
        }
    }else{
        return parentVal; // 直接返回父亲，因为没有孩子  
    }
}
LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = mergeHook
})
export function mergeOptions(parent,child){ // {...parent,...child}  {a:1.b:2}  {a:{a:{b:2}}}
    const options = {}
    // 如果父亲和儿子里都有一个属性 这个属性不冲突 
    for(let key in parent){ // 处理父亲的所有属性
        mergeField(key);
    }
    for(let key in child){ // 处理儿子的所有属性，如果父亲有的值 在第一个循环中就已经处理了
        if(!parent.hasOwnProperty(key)){
            mergeField(key);
        }
    }
    function mergeField(key){
        // 两个组件间 data是函数 

        // 写代码时很忌讳 各种if else if else 

        // 策略模式 根据不同的属性 调用不同的策略  
        if(strats[key]){
            // 这里就包含了 mergeHook的逻辑
            options[key] = strats[key](parent[key],child[key])
        }else if(isObject(parent[key]) && isObject(child[key])){
            options[key] = Object.assign(parent[key],child[key])
        }else{
            if(child[key] == null){
                options[key] = parent[key];
            }else{
                options[key] = child[key]; // 用儿子的值 直接覆盖掉 父亲的值
            }
        }
    } // 面试时 经常会提到对象间的合并
    return options
}
