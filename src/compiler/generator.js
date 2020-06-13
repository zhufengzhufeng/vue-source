const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function genProps(attrs){  // {id:'app',style:{color:red}}
    let str = ''
    for(let i = 0; i<attrs.length; i++){
        let attr = attrs[i]; // 取到每一个属性
        if(attr.name === 'style'){
            let obj = {}; //  color:red;background:green
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj; // 将原来的字符串换成了 刚才格式化后的对象
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`;
}
function gen(node){
    if(node.type === 1){
        return generate(node)
    }else{
        // 文本的处理
        let text = node.text;
        if(!defaultTagRE.test(text)){  // 有变量 {{}}
            return `_v(${JSON.stringify(text)})` // _v('helloworld')
        }else{
            let tokens = []; // 每次正则使用过后 都需要重新指定 lastIndex  aaaab
            let lastIndex =  defaultTagRE.lastIndex = 0;
            let match,index;
            while(match = defaultTagRE.exec(text)){
                index = match.index;
                // 通过 lastIndex,ndex
                tokens.push(JSON.stringify(text.slice(lastIndex,index)));
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join('+')})`
        }
        // helloworld {{  msg  }}  aa {{bb}}  aaa   => _v('helloworld'+_s(msg)+"aa" + _s(bb))
    }
}  
function genChildren(el){ // <div><span></span> hello</div>
    const children = el.children;
    if(children){
        return children.map(c=>gen(c)).join(',')
    }else{
        return false
    }
}
export function generate(el){
    let children = genChildren(el); // 生成孩子字符串
    let code = `_c("${el.tag}",${
            el.attrs.length? `${genProps(el.attrs)}`  : undefined
        }${
            children? `,${children}` :''
        })`;

    return code;
}
// 语法级的编译 