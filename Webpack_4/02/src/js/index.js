import '../css/a.css';
import '../css/b.css'; // import '@babel/polyfill';
import $ from 'jquery';
import print from './print';

console.log('index.js文件被加载了~');

print();

// eslint-disable-next-line
console.log($);

/*
  通过js代码，让某个文件被单独打包成一个chunk
  import动态导入语法：能将某个文件单独打包
*/
import(/* webpackChunkName: 'test' */ './test')
  .then(({ mul }) => {
    // 文件加载成功~
    // eslint-disable-next-line
    console.log(mul(2, 5));
  })
  .catch(() => {
    // eslint-disable-next-line
    console.log("文件加载失败~");
  });

const add = function add(x, y) {
  return x + y;
};
// eslint-disable-next-line
console.log(add(1, 2));

// 注册serviceWorker
// 处理兼容性问题
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        // eslint-disable-next-line
        console.log('sw注册成功了~');
      })
      .catch(() => {
        // eslint-disable-next-line
        console.log('sw注册失败了~');
      });
  });
}
