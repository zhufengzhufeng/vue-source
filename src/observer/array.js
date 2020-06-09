let oldArrayMethods = Array.prototype; // 获取数组原型上的方法

// 创建一个全新的对象 可以找到数组原型上的方法，而且修改对象时不会影响原数组的原型方法
export let arrayMethods = Object.create(oldArrayMethods);

let methods = [ // 这七个方法都可以改变原数组
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'splice' 
]
methods.forEach(method=>{
    arrayMethods[method] = function (...args) { // 函数劫持 AOP
        // 当用户调用数组方法时 会先执行我自己改造的逻辑 在执行数组默认的逻辑
        const ob = this.__ob__;
        let result  = oldArrayMethods[method].apply(this,args);
        let inserted;
        // push unshift splice 都可以新增属性  （新增的属性可能是一个对象类型）
        // 内部还对数组中引用类型也做了一次劫持  [].push({name:'zf'})
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice': // 也是新增属性  可以修改 可以删除  [].splice(arr,1,'div')
                inserted = args.slice(2);
                break;
            default:
                break;
        }
        inserted && ob.observeArray(inserted);
        return result;
    }
})




