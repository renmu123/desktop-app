var fs = require('fs');
var Path = require('path');
var needle = require('needle');
var AdmZip = require('adm-zip');
var async = require('async');

var Evt = require(path.resolve(appPath, './lib/evt'));

// 可以用全局变量
// console.log(NoteService);
// console.log('no---');
// console.log(process.cwd());

Upgrade = {
	basePath: Evt.getProjectBasePath(),
	dataBasePath: Evt.getProjectBasePath() + '/data',
	vFile: Evt.getProjectBasePath() + '/data/version',
	infoUrl: 'http://app.leanote.com/getUpgradeInfo',
	packgeUrl: 'http://app.leanote.com/getUpgradePackage', // http://static.leanote.top/0.3.4.zip

	msgs: {
		'en-us': {
			'downloadUrl': '<div style="font-size: 16px;">Please download the latest leanote desktop app from <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a></div>',
			'downloadUrlOr': 'Or you can download the latest leanote desktop app from <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a>'
		},
		'zh-cn': {
			'Upgrade error!': "升级错误",
			'downloadUrl': '<div style="font-size: 16px;">v2.0不支持在线升级, 请从 <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a> 下载最新Leanote桌面版本</div>',
			'downloadUrlOr': '或者从 <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a> 下载最新Leanote桌面版本',
			'The latest version': '新版本',
			'is available!': '可升级',
			'Updates:': '更新日志:',
			'Size: ': '大小: ',
			'No updates available.': '当前已是最新版',
			'Download upgrade package...': '正在下载升级包',
			'Just wait for a moment...': '请稍候',
			'Installing...': '正在安装...',
			'Upgrade to ': '升级到 ',
			' successful! Please <b style="color: red">restart Leanote</b> for the changes to take effect.': ' 成功, 请<b style="color: red">重新启动Leanote</b>'
		},
		'zh-hk': {
			'Upgrade error!': "升級錯誤",
			'downloadUrl': '<div style="font-size: 16px;">v2.0不支持在線升級, 請從 <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a> 下載最新Leanote桌面版本</div>',
			'downloadUrlOr': '或者從 <a onclick="openExternal(\'http://app.leanote.com\')" href="#"><b>http://app.leanote.com</b></a> 下載最新Leanote桌面版本',
			'The latest version': '新版本',
			'is available!': '可升級',
			'Updates:': '更新日誌:',
			'Size: ': '大小: ',
			'No updates available.': '當前已是最新版',
			'Download upgrade package...': '正在下載升級包',
			'Just wait for a moment...': '請稍候',
			'Installing...': '正在安裝...',
			'Upgrade to ': '升級到 ',
			' successful! Please <b style="color: red">restart Leanote</b> for the changes to take effect.': ' 成功, 請<b style="color: red">>重新啟動Leanote</b>'
		}
	},
	getMsg: function(key) {
		var lang = Api.curLang || 'en-us';
		if (!this.msgs[lang]) {
			return key;
		}
		return this.msgs[lang][key] || key;
	},
	init: function() {
		// windows下有bug, 因为只去了/node_modules
		this.basePath = this.basePath.replace('\\node_modules', '');
		this.dataBasePath = this.dataBasePath.replace('\\node_modules', '');
		this.vFile = this.vFile.replace('\\node_modules', '');
	},
	e: function() {
		$('.upgrade-progress').html('<span style="color: red">' + this.getMsg('Upgrade error!') + '</span>');
		setTimeout(function() {
			$('.upgrade-cancel-btn').attr('disabled', false);
			$('#upgradeDialog').modal('hide');
		}, 5000);
	},

	updateVersion: function(v) {
		var me = this;
		fs.writeFileSync(me.vFile, JSON.stringify(v));
	},

	initModal: function() {
		var me = this;
		$('.next-version-info').hide();
		$('.upgrade-progress').hide();
		$('.upgrade-cancel-btn').attr('disabled', false);
		$('.upgrade-btn').attr('disabled', true);
		$('.get-next-version-info-loading').show();
	},

	upgradeNotice: function () {
		return false;
		// 已经有了modal-backdrop
		if ($('.modal-backdrop').length) {
			return false;
		}
		if (SyncService.incrSyncStart) {
			return;
		}
		if (!UserInfo) {
			return false;
		}
		var userInfo = UserInfo;
		if (userInfo.Host != 'https://leanote.com') {
			return false;
		}

		var notice = `<div class="modal fade bs-modal-sm" id="upgradeAccountModal" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
			  <div class="modal-dialog modal-sm">
			    <div class="modal-content">
				  <div class="modal-header">
			        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			        <h4 class="modal-title" class="modalTitle">为了提供更好更优质的产品服务, 我们做了一个决定...</h4>
			      </div>
					<div class="modal-body">
						<p>您好, ${userInfo.Username}.</p>
						<p><strong>为了提供更好更优质的产品服务</strong>, 自2017-01-16起, <b>蚂蚁笔记面向新用户提供30天免费试用期</b>, 试用期内可以使用所有功能, 试用期结束后将无法进行多终端同步(web端除外). &nbsp;同时为了答谢老用户的支持, <b>我们已为所有老用户(有效用户)增加了一年旗舰套餐时间</b>.</p>
						<p>感谢所有朋友对蚂蚁笔记的厚爱,&nbsp;我们一直都在努力让知识管理更简单便捷, 让团队知识协作更快速高效,&nbsp;期待您升级旗舰套餐, 尊享极致的知识管理体验! 感谢大家的支持!</p>
						<p>此外, 蚂蚁笔记从一开始便开源在Github上(<a onclick="openExternal('https://github.com/leanote')">https://github.com/leanote</a>).&nbsp;STAR数4600+,&nbsp;是国际上最优秀的开源云笔记项目之一.在Github上我们汇聚了很多志同道合的朋友一起完善蚂蚁笔记, 欢迎更多的朋友加入我们, 为蚂蚁笔记贡献自己的力量!</p>
					</div>
					<div class="modal-footer">
						<button class="btn btn-primary" onclick="openExternal('https://leanote.com/pricing#buy')">前去升级帐户</button>
						<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
					</div>
			    </div>
			  </div>
			</div>`;
		if (window.TU || !localStorage.getItem('upgradeNotice')) {
			localStorage.setItem('upgradeNotice', 1);
			$(notice).modal();
		}
		return true;
	},

	// 自动, 需要升级才弹框
	checkForUpdatesAuto: function (cb) {
		var me = this;
		me.getCurVersion(function(v) {
			if(!v) {
				return cb();
			}
			me.initModal();
			
			me.checkUpgrade(v.version, function(nextV) {
				var nextVersion = nextV.nextVersion;
				$('.get-next-version-info-loading').hide();
				if(!v || !v.version || v.version == nextVersion) {
					return cb();
				}
				if (nextV.noOpenAuto) {
					return cb();
				}
				if (nextV.platform && nextV.platform.indexOf(process.platform.toLowerCase().substr(0, 3)) < 0) {
					return cb();
				}
				cb(true)

				var versionInfo = v.version;
				if (window.TU) {
					versionInfo += ' <span style="color: red; font-weight: bold">test</span>';
				}
				$('.cur-version').html(versionInfo);

				$('#upgradeDialog').modal({backdrop: 'static', keyboard: false});

				var mustRedownload = v.version < '1.0' || nextV.needReDownload;

				$('.next-version-info').html(
					me.getMsg('The latest version') + ' <b>' + nextVersion + '</b> ' + me.getMsg('is available!') + ' <br />' 
		              + me.getMsg('Updates:')
		              + '<div>'
		              + (nextV.desc || '')
		              + '</div>'
		              + '<br />'
		              + (mustRedownload ? me.getMsg('downloadUrl') : me.getMsg('downloadUrlOr'))).show();
				$('.upgrade-btn').attr('disabled', false);
				$('.upgrade-btn').unbind('click').click(function() {
					if (mustRedownload) {
						openExternal('http://app.leanote.com');
					}
					else {
						$('.upgrade-cancel-btn').attr('disabled', true);
						$('.upgrade-btn').attr('disabled', true);
						me.upgrade(v.version, nextV);
					}
				});
			});
		});
	},

	checkForUpdates: function() {
		var me = this;
		me.getCurVersion(function(v) {
			if(!v) {
				return;
			}
			me.initModal();

			var versionInfo = v.version;
			if (window.TU) {
				versionInfo += ' <span style="color: red; font-weight: bold">test</span>';
			}

			$('.cur-version').html(versionInfo);
			$('#upgradeDialog').modal({backdrop: 'static', keyboard: false});

			me.checkUpgrade(v.version, function(nextV) {
				var nextVersion = nextV.nextVersion;
				$('.get-next-version-info-loading').hide();
				if(!v || !v.version || v.version == nextVersion) {
					$('.next-version-info').html(me.getMsg("No updates available.")).show();
					return;
				}

				var mustRedownload = v.version < '1.0' || nextV.needReDownload;

				$('.next-version-info').html(
					me.getMsg('The latest version') + ' <b>' + nextVersion + '</b> ' + me.getMsg('is available!') + ' <br />' 
		              + me.getMsg('Updates:')
		              + '<div>'
		              + (nextV.desc || '')
		              + '</div>'
		              + '<br />'
		              + (mustRedownload ? me.getMsg('downloadUrl') : me.getMsg('downloadUrlOr'))).show();
				$('.upgrade-btn').attr('disabled', false);
				$('.upgrade-btn').unbind('click').click(function() {
					if (mustRedownload) {
						openExternal('http://app.leanote.com');
					}
					else {
						$('.upgrade-cancel-btn').attr('disabled', true);
						$('.upgrade-btn').attr('disabled', true);
						me.upgrade(v.version, nextV);
					}
				});
			});
		});
	},

	// 得到当前版本
	getCurVersion: function (callback) {
		var me = this;
		// fs.writeFileSync('./output.json',JSON.stringify({a:1,b:2}));
		try {
			var v = JSON.parse(fs.readFileSync(me.vFile));
			try {
				if (v.version == '2.2' && process.versions.electron == '1.1.1') {
					v.version = '2.2.1';
				}
			} catch(e) {
			}
			callback(v);
		} catch(e) {
			console.error(e);
			callback(false);
		}
	},

	// 检查是否可升级, 覆盖common.js的
	checkUpgrade: function (curVersion, callback) {
		var me = this;
		var url = me.infoUrl;
		// 是测试的, Test Upgrade
		if (window.TU) {
			url += 'Test';
		}
		needle.get(url + '?version=' + curVersion, function(err, resp) {
			if(err) {
				return me.e();
			}
			var ret = resp.body;
			if(typeof ret != 'object') {
				return me.e();
			}
			callback(ret);
		});
	},
		
	upgrade: function(curVersion, ret) {
		var me = this;
		var $progress = $('.upgrade-progress');
		$progress.show();
		var url = "http://static.leanote.top/" + ret.nextVersion + ".zip";
		$progress.html(me.getMsg('Download upgrade package...') + '<br />' + url + '<br /> ' + me.getMsg('Just wait for a moment...'));

		// 升级之
		// 下载最新的版本
		// needle.get(me.packgeUrl + '?version=' + ret.nextVersion, {timeout: 500000}, function(err, resp) {
		needle.get(url, {timeout: 500000}, function(err, resp) {
			if(err || resp.statusCode == 404) {
				return me.e();
			}

			var typeStr = resp.headers['content-type'];
			if(typeStr != 'application/zip') {
				return me.e();
			}

			// 1. 下载到data目录, 解压之, 得到所有文件
			var filename = ret.nextVersion + '.zip';
			var filePath = me.dataBasePath + '/' + filename;
			var err = fs.writeFileSync(filePath, resp.body);
			if(err) {
				return me.e();
			}

			$progress.html(me.getMsg('Installing...'));

			// https://github.com/cthackers/adm-zip
			try {
				me.rmdir(me.dataBasePath + '/' + ret.nextVersion);
			} catch(e) {
				console.error(e);
			}
			var zip = new AdmZip(filePath);
			zip.extractAllTo(me.dataBasePath + '/' + ret.nextVersion, true);
			try {
				fs.unlinkSync(filePath);
			} catch(e) {
			}

			// 2. 先保存之前的文件作备份
			me.backup(me.dataBasePath + '/' + ret.nextVersion, ret.nextVersion, curVersion, function(fileList) {
				// 3. 覆盖
				me.overWrite(fileList, ret.nextVersion, function(ok) {
					if(!ok) {
						return me.e();
					}
					var lastVersionFilePath = curVersion;
					// 4. 更新v
					me.updateVersion(
						{
							version: ret.nextVersion, // 当前版本
							lastVersion: curVersion, // 上一版本
							lastVersionFilePath: lastVersionFilePath, // 备份的文件夹名称
							updatedTime: new Date() // 更新日期
						}
					);

					$progress.html(me.getMsg('Upgrade to ') + ret.nextVersion + me.getMsg(' successful! Please <b style="color: red">restart Leanote</b> for the changes to take effect.'));
					$('.cur-version').text(ret.nextVersion);
					$('.upgrade-cancel-btn').attr('disabled', false);
					setTimeout(function() {
						$('#upgradeDialog').modal('hide');
					}, 3000);
				});
			});
		});
	},

	rmdir: function (path) {
	    var walk = function(path) {
            files = fs.readdirSync(path);
            files.forEach(function(item) {  
                var tmpPath = path + '/' + item;
                var stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {  
                    walk(tmpPath); 
                    fs.rmdirSync(tmpPath);
                }
                else {  
                	fs.unlinkSync(tmpPath);
                }
            });  
        };
        try {
		    walk(path);
        } catch(e) {
        	console.log(e);
        }
	},

	scanFolder: function (p) {
		var me = this;
	    var fileList = [];
	    var folderList = [];
	   
	    var walk = function(p, fileList, folderList) {
            files = fs.readdirSync(p);
            files.forEach(function(item) {  
                var tmpPath = p + '/' + item;
                var stats = fs.statSync(tmpPath);

                if (stats.isDirectory() && item.indexOf('_') != 0) {  
                    walk(tmpPath, fileList, folderList); 
                    folderList.push(tmpPath); 
                }
                else if (item.indexOf('_') != 0) {  
                    fileList.push(tmpPath); 
                }
            });  
        };  


	    walk(p, fileList, folderList);

	    return fileList;
	},

	mkdirsSync: function(dirpath) {
		var me = this;
	    if(fs.existsSync(dirpath)) {
	    	return;
	    }
        // 尝试创建父目录，然后再创建当前目录
        me.mkdirsSync(Path.dirname(dirpath));
        fs.mkdirSync(dirpath);
	},

	// 复制文件
	copyFile: function(src, dist, callback) {
		var me = this;
		if(!src || !dist) {
			return callback && callback(false);
		}

		var filePathNameArrs = dist.split('/');
		var filename = filePathNameArrs.pop();
		var filePath = filePathNameArrs.join('/');
		// 创建文件夹
		me.mkdirsSync(filePath);

		// 如果src存在
		if(fs.existsSync(src)) {
			var readStream = fs.createReadStream(src);
			var writeStream = fs.createWriteStream(dist);
			readStream.pipe(writeStream);
			readStream.on('end', function () {
				callback && callback(true);
			});
			readStream.on('error', function () {
				callback && callback(false);
			});
		} else {
			callback && callback(true);
		}
	},

	// backup curVersion file 
	// 一一对应备份
	// nextVersionFilePath == /a/data/1.0
	backup: function(nextVersionFilePath, nextVersion, curVersion, callback) {
		var me = this;

		// 先删除本地的
		try {
			me.rmdir(me.dataBasePath + '/' + curVersion);
		} catch(e) {}

		var fileList = me.scanFolder(nextVersionFilePath); // 每一个文件都包含路径, /a/data/1.0/src/note.html
		console.log(nextVersionFilePath);
		console.log(fileList);
		
		async.eachSeries(fileList, function(filePathName, cb) {
			// /a/data/1.0/src/a.html <=> /a/data/1.1/src/a.html
			// /a/src/a.html => /a/data/1.1/src/a.html
			var source = filePathName.replace('/data/' + nextVersion, '');
			var targetPathName = filePathName.replace('/data/' + nextVersion, '/data/' + curVersion);
			me.copyFile(source, targetPathName, function() {
				cb();
			});
		}, function() {
			callback(fileList);
		});
	},

	// 覆盖之
	overWrite: function(fileList, version, callback) {
		var me = this;
		async.eachSeries(fileList, function(filePathName, cb) {
			// /a/data/1.0/src/a.html => /a/src/a.html
			var targetPathName = filePathName.replace('/data/' + version, '');
			console.log(filePathName + ' => ' + targetPathName);
			me.copyFile(filePathName, targetPathName, function() {
				cb();
			});
		}, function() {
			callback(true);
		});
	},

	// 回滚到上一版本, for test
	rollabackUpgrade: function () {
		var me = this;
		me.getCurVersion(function(v) {
			if(!v.lastVersion || !v.lastVersionFilePath) {
				return;
			}

			// 解压上一version文件, 并覆盖之
			var path = me.dataBasePath + '/' + v.lastVersionFilePath;
			var fileList = me.scanFolder(path); // 每一个文件都包含路径, /a/data/1.0/src/note.html
			
			me.overWrite(fileList, v.lastVersion, function() {

				me.updateVersion(
					{
						version: v.lastVersion, // 当前版本
						lastVersion: '', // 上一版本
						lastVersionFilePath: '', // 备份的文件夹名称
						updatedTime: new Date() // 更新日期
					}
				);

			});
		});
	},

	log: function() {
		var params = {
			type: 'start',
			userId: UserInfo.UserId,
			username: UserInfo.Username,
			host: UserInfo.Host,
			platform: process.platform
		};
		needle.post('http://app.leanote.com/log', params, function () {});

		setInterval(function () {
			var params = {
				type: 'interval',
				userId: UserInfo.UserId,
				username: UserInfo.Username,
				host: UserInfo.Host,
				platform: process.platform
			};
			needle.post('http://app.leanote.com/log', params, function () {});
		}, 1000 * 60 * 60 * 1) // 1h
	}
};

var checkUpgrade = function() {
	Upgrade.checkUpgrade();
};
var rollabackUpgrade = function() {
	Upgrade.rollabackUpgrade();
};

Upgrade.init();
setTimeout(function () {
	Upgrade.checkForUpdatesAuto(function (auto) {
	});

	try {
		Upgrade.log();
	} catch(e) {
	}
}, 1000)
