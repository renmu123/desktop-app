var db = require(path.resolve(appPath, './lib/db'));
var User = require(path.resolve(appPath, './lib/user'));
var Attachs = db.attachs;

function log(o) {
	console.log(o);
}

// 附件服务
var Attach = {}

module.exports = Attach;
