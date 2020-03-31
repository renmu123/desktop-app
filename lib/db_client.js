/**
 * db_main的db client, 调用db client即会调用后端的db_main
 */
var path = require('path');
var appPath = require('electron-root-path').rootPath;

var DatastoreProxy = require(path.resolve(appPath, './lib/nedb_proxy'));
var Evt = require(path.resolve(appPath, './lib/evt'));
var ipc = require('electron').ipcRenderer;

// console.log(dbPath);
// g, 表全局环境
var db = {};
var dbNames = ['images']; // 现在只有images表在后台控制
for(var i in dbNames) {
    var name = dbNames[i];
    (function (name) {
        db[name] = new DatastoreProxy(name);
    })(name);
}

// 在db.js的initForUser时调用
// 初始化, 给后端发消息
db.init = function (curUser, dbPath) {
    ipc.send('db-init', {
        curUser: curUser,
        dbPath: dbPath,
        dataBasePath: Evt.getBasePath()
    });
};

module.exports = db; 
console.log('db inited');