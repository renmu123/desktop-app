var path = require('path');
var appPath = require('electron-root-path').rootPath;
var Common = require(path.resolve(appPath, './lib/common'));

var Evt = require(path.resolve(appPath, './lib/evt'));
var app = require('electron').remote.app; // .require('app');
var basePath = app.getPath('appData') + '/leanote'; // /Users/life/Library/Application Support/Leanote'; // require('nw.gui').App.dataPath;
Evt.setDataBasePath(basePath);
var protocol = require('electron').protocol; // .require('protocol');
// 数据库初始化
var db = require(path.resolve(appPath, './lib/db'));
// db.init();
db.initGlobal();
// 所有service, 与数据库打交道
var Service = {
	notebookService: require(path.resolve(appPath, './lib/notebook')),
	noteService: require(path.resolve(appPath, './lib/note')),
	userService: require(path.resolve(appPath, './lib/user')),
	tagService: require(path.resolve(appPath, './lib/tag')),
	apiService: require(path.resolve(appPath, './lib/api')),
	syncServie: require(path.resolve(appPath, './lib/sync'))
};
// 全局变量
var ApiService = Service.apiService;
var UserService = Service.userService;
var SyncService = Service.syncServie;
var NoteService = Service.noteService;
var NotebookService = Service.notebookService;
var TagService = Service.tagService;
var WebService = require(path.resolve(appPath, './lib/web'));
var FileService = require(path.resolve(appPath, './lib/file'));
var EvtService = require(path.resolve(appPath, './lib/evt'));
var path = require('path');
var appPath = require('electron-root-path').rootPath;
var CommonService = require(path.resolve(appPath, './lib/common'));

// NodeJs
var NodeFs = require('fs');

// 分发服务
// route = /note/notebook
// 过时
Service.dispatch = function() {};
var gui = require(path.resolve(appPath, './lib/gui'));
// var remote = require('remote');

var projectPath = __dirname;
