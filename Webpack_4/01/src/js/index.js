import data from "../data.json";
import "../css/index.css";
import "../css/index.less";
import "../css/iconfont.css";
import print from "./print";

console.log(data);
let add = (x, y) => x + y;
console.log(add(1, 7));

console.log("index.js文件加载了");
print();

if (module.hot) {
    // 一旦 module.hot 为true，说明开启了HMR功能。 --> 让HMR功能代码生效
    module.hot.accept('./print.js', function() {
      // 方法会监听 print.js 文件的变化，一旦发生变化，其他模块不会重新打包构建。
      // 会执行后面的回调函数
      print();
    });
  }
