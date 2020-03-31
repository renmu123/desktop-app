var path = require('path');
var appPath = require('electron-root-path').rootPath;
var Common = require(path.resolve(appPath, './lib/common'));

var Evt = require(path.resolve(appPath, './lib/evt'));
var app = require('electron').remote.app; // .require('app');
var basePath = app.getPath('appData') + '/leanote'; // /Users/life/Library/Application Support/Leanote'; // require('nw.gui').App.dataPath;
Evt.setDataBasePath(basePath);

// 所有service, 与数据库打交道
var Service = {
	userService: require(path.resolve(appPath, './lib/user')),
	apiService: require(path.resolve(appPath, './lib/api')),
};

var db = require(path.resolve(appPath, './lib/db'));
db.initGlobal();

// 全局变量
var ApiService = Service.apiService;
var UserService = Service.userService;
var EvtService = Evt;
var CommonService = Common;

var gui = require(path.resolve(appPath, './lib/gui'));