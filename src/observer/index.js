import {isObject} from '../utils.js';

// es6的类来实现的
class Observer{
    constructor(data){
        this.walk(data); // 可以对数据一步一步的处理
    }
    walk(data){
        // 对象的循环   data:{msg:'zf',age:11}
        Object.keys(data).forEach(key=>{
            defineReactive(data,key,data[key]);// 定义响应式的数据变化
        })
    }
}
// vue2 的性能 递归重写get和set  proxy
function defineReactive(data,key,value){
    observe(value); // 如果传入的值还是一个对象的话 就做递归循环检测
    Object.defineProperty(data,key,{
        get(){
            return value
        },
        set(newValue){
            if(newValue == value) return;
            observe(newValue); // 监控当前设置的值，有可能用户给了一个新值
            value = newValue;
        }
    })
}

export function observe(data){
    // 对象就是使用defineProperty 来实现响应式原理

    // 如果这个数据不是对象 或者是null 那就不用监控了
    if(!isObject(data)){
        return;
    }
    
    // 对数据进行defineProperty
    return new Observer(data); // 可以看到当前数据是否被观测过
}