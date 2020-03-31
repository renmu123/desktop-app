// 服务测试
var path = require('path');
var appPath = require('electron-root-path').rootPath;
var Common = require(path.resolve(appPath, './lib/common'));
var pwd = Common.md5('abc123', '1d22e0ec60ca20a1f0259cdd00eb7cfd');
console.log(pwd);