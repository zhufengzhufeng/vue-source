(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 此处放所有的工具方法
  function isObject(obj) {
    return _typeof(obj) === 'object' && obj !== null;
  }
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'mounted', 'beforeUpdate', 'updated'];
  var strats = {};

  function mergeHook(parentVal, childVal) {
    // []
    if (childVal) {
      // 如果 孩子有值 
      if (parentVal) {
        // 父亲有值 就直接拼接
        return parentVal.concat(childVal);
      } else {
        // 如果孩子有值父亲没值 就将孩子包装成数组
        return [childVal]; // Vue.options.beforeCreate = [childVal]
      }
    } else {
      return parentVal; // 直接返回父亲，因为没有孩子  
    }
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  function mergeOptions(parent, child) {
    // {...parent,...child}  {a:1.b:2}  {a:{a:{b:2}}}
    var options = {}; // 如果父亲和儿子里都有一个属性 这个属性不冲突 

    for (var key in parent) {
      // 处理父亲的所有属性
      mergeField(key);
    }

    for (var _key in child) {
      // 处理儿子的所有属性，如果父亲有的值 在第一个循环中就已经处理了
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      // 两个组件间 data是函数 
      // 写代码时很忌讳 各种if else if else 
      // 策略模式 根据不同的属性 调用不同的策略  
      if (strats[key]) {
        // 这里就包含了 mergeHook的逻辑
        options[key] = strats[key](parent[key], child[key]);
      } else if (isObject(parent[key]) && isObject(child[key])) {
        options[key] = Object.assign(parent[key], child[key]);
      } else {
        if (child[key] == null) {
          options[key] = parent[key];
        } else {
          options[key] = child[key]; // 用儿子的值 直接覆盖掉 父亲的值
        }
      }
    } // 面试时 经常会提到对象间的合并


    return options;
  }

  var oldArrayMethods = Array.prototype; // 获取数组原型上的方法
  // 创建一个全新的对象 可以找到数组原型上的方法，而且修改对象时不会影响原数组的原型方法

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = [// 这七个方法都可以改变原数组
  'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      // 函数劫持 AOP
      // 当用户调用数组方法时 会先执行我自己改造的逻辑 在执行数组默认的逻辑
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args);
      var inserted; // push unshift splice 都可以新增属性  （新增的属性可能是一个对象类型）
      // 内部还对数组中引用类型也做了一次劫持  [].push({name:'zf'})

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // 也是新增属性  可以修改 可以删除  [].splice(arr,1,'div')
          inserted = args.slice(2);
          break;
      }

      inserted && ob.observeArray(inserted);
      return result;
    };
  });

  var id = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 1. 让dep 记住watcher
        // 2. 让watcher 记住dep 双向记忆
        Dep.target.addDep(this); // 让watcher 存储dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; // 默认target是空的
  function pushTarget(watcher) {
    Dep.target = watcher; //  stack.push(watcher) // []
  }
  function popTarget() {
    Dep.target = null; //   stack.pop();
    //   Dep.target = stack[stack.length-1];
  }
  // 每个属性 都有一个dep属性 ，dep 存放着watcher  一个dep中有多个watcher ，一个watcher可能被多个属性所依赖

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 对数组索引进行拦截 性能差而且直接更改索引的方式并不多
      Object.defineProperty(data, '__ob__', {
        // __ob__ 是一个响应式饿表示 对象数组都有
        enumerable: false,
        // 不可枚举
        configurable: false,
        value: this
      }); // data.__ob__ = this; // 相当于在数据上可以获取到__ob__这个属性 指代的是Observer的实例

      if (Array.isArray(data)) {
        // vue如何对数组进行处理呢？ 数组用的是重写数组的方法  函数劫持
        // 改变数组本身的方法我就可以监控到了
        data.__proto__ = arrayMethods; // 通过原型链 向上查找的方式
        // [{a:1}]    => arr[0].a = 100

        this.observeArray(data);
      } else {
        this.walk(data); // 可以对数据一步一步的处理
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]); // 检测数组的对象类型
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 对象的循环   data:{msg:'zf',age:11}
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]); // 定义响应式的数据变化
        });
      }
    }]);

    return Observer;
  }(); // vue2 的性能 递归重写get和set  proxy


  function defineReactive(data, key, value) {
    observe(value); // 如果传入的值还是一个对象的话 就做递归循环检测

    var dep = new Dep(); // msg.dep =[watcher]  age.dep = [watcher]  // 渲染watcher中.deps [msg.dep,age.dep]

    Object.defineProperty(data, key, {
      get: function get() {
        // 这里会有取值的操作  ，给这个属性增加一个dep，这个dep 要和刚才我放到全局变量的上的watcher 做一个对应关系
        if (Dep.target) {
          dep.depend(); // 让这个dep 去收集watcher
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue == value) return;
        observe(newValue); // 监控当前设置的值，有可能用户给了一个新值

        value = newValue; // 当我们更新数据后 要把当前自己对应的watcher 去重新执行以下 

        dep.notify();
      }
    });
  }

  function observe(data) {
    // 对象就是使用defineProperty 来实现响应式原理
    // 如果这个数据不是对象 或者是null 那就不用监控了
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__ instanceof Observer) {
      // 防止对象被重复观测
      return;
    } // 对数据进行defineProperty


    return new Observer(data); // 可以看到当前数据是否被观测过
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    } // computed ... watch

  }

  function proxy(target, property, key) {
    Object.defineProperty(target, key, {
      get: function get() {
        return target[property][key];
      },
      set: function set(newValue) {
        target[property][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 数据响应式原理
    var data = vm.$options.data; // 用户传入的数据
    // vm._data 就是检测后的数据了

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 观测数据
    // 将数据全部代理到vm的实例上

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data); // 观测这个数据
  }

  //              字母a-zA-Z_ - . 数组小写字母 大写字母  
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获   <aaa:aaa>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  // 闭合标签 </xxxxxxx>  

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // <div aa   =   "123"  bb=123  cc='123'
  // 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // <div >   <br/>

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  function parseHTML(html) {
    // ast 树 表示html的语法
    var root; // 树根 

    var currentParent;
    var stack = []; // 用来判断标签是否正常闭合  [div]  解析器可以借助栈型结构
    // <div id="app" style="color:red"><span>    helloworld {{msg}}   </span></div>
    // vue2.0 只能有一个根节点 必须是html 元素
    // 常见数据结构 栈 队列 数组 链表 集合 hash表 树

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1 // 1 普通元素  3 文本

      };
    } // console.log(html)


    function start(tagName, attrs) {
      // 开始标签 每次解析开始标签 都会执行此方法
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element; // 只有第一次是根
      }

      currentParent = element;
      stack.push(element);
    } // <div> <span></span> hello world</div>   [div,span]


    function end(tagName) {
      // 结束标签  确立父子关系
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      // 文本
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    } // 根据 html 解析成树结构  </span></div>


    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTageMatch = parseStartTag();

        if (startTageMatch) {
          // 开始标签
          start(startTageMatch.tagName, startTageMatch.attrs);
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
        } // 结束标签 

      } // 如果不是0 说明是文本


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd); // 是文本就把文本内容进行截取

        chars(text);
      }

      if (text) {
        advance(text.length); // 删除文本内容
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // 匹配开始标签

      if (start) {
        var match = {
          tagName: start[1],
          // 匹配到的标签名
          attrs: []
        };
        advance(start[0].length);

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    // {id:'app',style:{color:red}}
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // 取到每一个属性

      if (attr.name === 'style') {
        (function () {
          var obj = {}; //  color:red;background:green

          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj; // 将原来的字符串换成了 刚才格式化后的对象
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return generate(node);
    } else {
      // 文本的处理
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        // 有变量 {{}}
        return "_v(".concat(JSON.stringify(text), ")"); // _v('helloworld')
      } else {
        var tokens = []; // 每次正则使用过后 都需要重新指定 lastIndex  aaaab

        var lastIndex = defaultTagRE.lastIndex = 0;
        var match, index;

        while (match = defaultTagRE.exec(text)) {
          index = match.index; // 通过 lastIndex,ndex

          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      } // helloworld {{  msg  }}  aa {{bb}}  aaa   => _v('helloworld'+_s(msg)+"aa" + _s(bb))

    }
  }

  function genChildren(el) {
    // <div><span></span> hello</div>
    var children = el.children;

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(',');
    } else {
      return false;
    }
  }

  function generate(el) {
    var children = genChildren(el); // 生成孩子字符串

    var code = "_c(\"".concat(el.tag, "\",").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : undefined).concat(children ? ",".concat(children) : '', ")");
    return code;
  } // 语法级的编译

  function compileToFunctions(template) {
    // console.log(template)
    // 实现模板的编译
    var ast = parseHTML(template); // 代码生成
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

    var code = generate(ast); // 代码生成 =》 拼接字符串

    code = "with(this){ \r\nreturn ".concat(code, " \r\n}");
    var render = new Function(code); // 相当于给字符串变成了函数
    // 注释节点 自闭和标签 事件绑定 @click  class slot插槽

    return render; // 模板编译原理 
    // 1.先把我们的代码转化成ast语法树 （1）  parser 解析  (正则)
    // 2.标记静态树  （2） 树得遍历标记 markup  只是优化
    // 3.通过ast产生的语法树 生成 代码 =》 render函数  codegen
  }

  var has = {}; // vue源码里有的时候去重用的是set 有的时候用的是对象来实现的去重

  var queue = []; // 这个队列是否正在等待更新

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    }

    queue = [];
    has = {};
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      has[id] = true; // 如果没有注册过这个watcher，就注册这个watcher到队列中，并且标记为已经注册

      queue.push(watcher);
      nextTick(flushSchedulerQueue); // flushSchedulerQueue 调用渲染watcher
    }
  }
  var callbacks = []; // [flushSchedulerQueue,fn]

  var pending = false;

  function flushCallbacksQueue() {
    callbacks.forEach(function (fn) {
      return fn();
    });
    pending = false;
  }

  function nextTick(fn) {
    callbacks.push(fn); // 防抖

    if (!pending) {
      // true  事件环的概念 promise mutationObserver setTimeout setImmediate
      setTimeout(function () {
        flushCallbacksQueue();
      }, 0);
      pending = true;
    }
  }

  var id$1 = 0; // 做一个watcher 的id 每次创建watcher时 都有一个序号 
  // 目前写到这里 只有一个watcher 渲染watchrer，只要视图中使用到了这个属性，而且属性变化了就要更新视图

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.deps = []; // 这个watcher会存放所有的dep

      this.depsId = new Set();

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn;
      }

      this.id = id$1++;
      this.get();
    }

    _createClass(Watcher, [{
      key: "run",
      value: function run() {
        this.get(); // 重新渲染
      }
    }, {
      key: "get",
      value: function get() {
        // 1.是先把渲染watcher 放到了 Dep.target上
        // 2.this.getter()  是不是去页面取值渲染  就是调用defineProperty的取值操作
        // 3.我就获取当前全局的Dep.target,每个属性都有一个dep 取值是就将Dep.target 保留到当前的dep中
        // 4.数据变化 通知watcher 更新 
        pushTarget(this); // 在取值之前 将watcher先保存起来

        this.getter(); // 这句话就实现了视图的渲染  -》 操作是取值 

        popTarget(); // 删掉watcher
        // Vue是组件级别更新的
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this); // 让当前dep 订阅这个watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        // 更新原理
        queueWatcher(this); // 将watcher存储起来
        // this.get();  // 以前调用get方法是直接更新视图
      }
    }]);

    return Watcher;
  }();

  function patch(oldVnode, newVnode) {
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 真实元素
      var oldElm = oldVnode;
      var parentElm = oldElm.parentNode;
      var el = createElm(newVnode);
      parentElm.insertBefore(el, oldElm.nextSibling);
      parentElm.removeChild(oldElm);
      return el; // 渲染的真实dom
    }
  }

  function createElm(vnode) {
    // 需要递归创建
    var tag = vnode.tag,
        children = vnode.children,
        data = vnode.data,
        key = vnode.key,
        text = vnode.text;

    if (typeof tag == 'string') {
      // 元素 // 将虚拟节点和真实节点做一个映射关系 （后面diff时如果元素相同直接复用老元素 ）
      vnode.el = document.createElement(tag);
      updateProperties(vnode); // 跟新元素属性

      children.forEach(function (child) {
        // 递归渲染子节点 将子节点 渲染到父节点中
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 普通的文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var el = vnode.el;
    var newProps = vnode.data || {};

    for (var key in newProps) {
      if (key == 'style') {
        for (var styleName in newProps.style) {
          // {color:red,background:green}
          el.style[styleName] = newProps.style[styleName];
        }
      } // event 
      else {
          el.setAttribute(key, newProps[key]);
        }
    }
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 将虚拟节点 变成 真实节点 替换掉$el
      // 后续 dom diff 也会执行此方法

      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // Vue在渲染的过程中 会创建一个 所谓的“渲染watcher ” 只用来渲染的
    // watcher就是一个回调 每次数据变化 就会重新执行watcher
    // Vue是不是MVVM框架
    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      // 内部会调用刚才我们解析后的render方法 =》 vnode
      // _render => options.render 方法
      // _update => 将虚拟dom 变成真实dom 来执行
      console.log('update');

      vm._update(vm._render());
    }; // 每次数据变化 就执行 updateComponent 方法 进行更新操作


    new Watcher(vm, updateComponent, function () {}, true);
    callHook(vm, 'mounted'); // vue 响应式数据的规则 数据变了 视图会刷新
  }
  function callHook(vm, hook) {
    // vm.$options
    var handlers = vm.$options[hook]; // 典型的发布订阅模式

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        // [fn,fn,fn]
        handlers[i].call(vm); // 所有的生命周期的this 指向的都是当前的实例
      }
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // Vue的内部 $options 就是用户传递的所有参数
      var vm = this; // 这个options 就包含了用户创建实例时传入的所有属性 Vue.options

      vm.$options = mergeOptions(vm.constructor.options, options); // 用户传入的参数

      callHook(vm, 'beforeCreate');
      initState(vm); // 初始化状态

      callHook(vm, 'created'); // 需要通过模板进行渲染

      if (vm.$options.el) {
        // 用户传入了el属性
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 可能是字符串 也可以传入一个dom对象
      var vm = this;
      el = vm.$el = document.querySelector(el); // 获取el属性
      // 如果同时传入 template 和render  默认会采用render 抛弃template，如果都没传就使用id="app"中的模板

      var opts = vm.$options;

      if (!opts.render) {
        var template = opts.template;

        if (!template && el) {
          // 应该使用外部的模板
          template = el.outerHTML;
          console.log(template);
        }

        var render = compileToFunctions(template);
        opts.render = render;
      } // 走到这里说明不需要编译了 ，因为用户传入的就是 一个render函数


      mountComponent(vm); // 组件的挂载流程
    };
  }

  function createTextVNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }
  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    // vue中的key 不会作为属性传递给组件
    return vnode(tag, data, data.key, children);
  } // 虚拟节点是 产生一个对象 用来描述dom结构 增加自定义属性
  // ast 他是描述 dom语法的 

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._render = function () {
      // 调用我们自己实现的render方法
      var vm = this;
      var render = vm.$options.render;

      Vue.prototype._v = function (text) {
        // 创建文本的虚拟及诶点
        return createTextVNode(text);
      };

      Vue.prototype._c = function () {
        return createElement.apply(void 0, arguments);
      };

      Vue.prototype._s = function (val) {
        // 判断当前这个值是不是对象 ，如果是对象 直接转换成字符串 ，防止页面出现[object Object]
        return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
      };

      var vnode = render.call(vm); // _c _c  _s

      return vnode;
    };
  }

  // Vue.directive Vue.filter Vue.component
  function initGlobalAPI(Vue) {
    // 全局api 肯定接受很多参数
    Vue.options = {}; // 所有的全局api 用户传递的参数 都会绑定到这个对象中 
    // 提取公共的方法 逻辑，通过此方法混合到每个实例中

    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      console.log(this.options);
    };
  }

  function Vue(options) {
    // 内部要进行初始化的操作 
    this._init(options); // 初始化操作

  }

  initMixin(Vue); // 添加原型的方法

  renderMixin(Vue);
  lifeCycleMixin(Vue); // initGlobalApi 给构造函数来扩展全局的方法

  initGlobalAPI(Vue);
  Vue.prototype.$nextTick = nextTick;

  return Vue;

})));
//# sourceMappingURL=vue.js.map
