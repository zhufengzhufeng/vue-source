import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';


export default {
    input: './src/index.js',
    output: {
        format: 'umd', // amd commonjs规范  默认将打包后的结果挂载到window上
        file: 'dist/vue.js', // 打包出的vue.js 文件  new Vue
        name: 'Vue',
        sourcemap: true
    },
    plugins: [
        babel({ // 解析es6 -》 es5
            exclude: "node_modules/**" // 排除文件的操作 glob  
        }),
        serve({ // 开启本地服务
            open: true,
            openPage: '/public/index.html',
            port: 3000,
            contentBase: ''
        })
    ]
}