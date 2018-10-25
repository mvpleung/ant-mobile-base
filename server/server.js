const Loadable = require('react-loadable');
const Router = require('koa-router');
const path = require('path');
const staticCache = require('koa-static-cache');
const Koa = require('koa');
const render = require('./render.js');

const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const gzip = require('koa-compress');
const range = require('koa-range'); //解决视频播放,断点续传

const app = new Koa();
app.keys = ['abcdefg123']; //签名
app.use(gzip());
app.use(bodyParser()); //解析Json或者form
app.use(range);
app.use(cors({ credentials: true })); //跨域

const router = new Router();
router.get('/', render);
app.use(router.routes()).use(router.allowedMethods());
app.use(staticCache(path.resolve(__dirname, '../build'), { maxAge: 365 * 24 * 60 * 60 }));
app.use(render);

//获取局域网ip 方便手机测试
function getIPAdress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}

Loadable.preloadAll().then(() => {
  app.listen(8182, () => {
    console.log(`http://${getIPAdress()}:8182`);
    console.log('服务启动');
  });
});
