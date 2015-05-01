// 本地api集成
function isURL(str_url) {
    var re = new RegExp("^((https|http|ftp|rtsp|mms|emailto)://).+");
    return re.test(str_url);
}

// 浏览器打开
function openExternal(url) {
    gui.Shell.openExternal(url);
}

function isMac() {
	return process.platform === 'darwin';
}

// 窗口大小设置
// var win = gui.Window.get();

var downloadImgPath;
$(function() {

	var isMacP = isMac();
	/*
	$('.tool-close, .tool-close-blur').click(function() {
		// mac下关闭才是隐藏
		if(isMacP) {
			win.hide();
		} else {
			win.close();
		}
	});
	*/
	// 从login.html -> note.html过来就没有reopen事件了?
	// note.html -> login.html -> note.html, 使得两次bind
	/*
	if(gui.App._events) {
		gui.App._events.reopen = function() {
		    win.show();
		    win.focus();
		}
	} else {
		gui.App.on('reopen', function() {
		    win.show();
		    win.focus();
		});
	}
	*/

	$('.tool-min, .tool-min-blur').click(function() {
		win.minimize();
	});
	$('.tool-max, .tool-max-blur').click(function() {
		win.maximize();
		// win.toggleFullscreen(); // mac下是新屏幕
		// 全屏模式
		// win.toggleKioskMode();
	});

	// 下载图片输入框
	$('#downloadImgInput').change(function() {
		var name = $(this).val();
		$(this).val(''); // 为防止重名不触发
		if(downloadImgPath) {
			
		}
	});
});

// bind close event
// 保存当前打开的笔记

// 菜单
// 更多menu用法: http://www.cnblogs.com/xuanhun/p/3669216.html
function Menu() {
    this.menu = new gui.Menu();
    this.cut = new gui.MenuItem({
        label: getMsg('Cut'),
        click: function() {
            document.execCommand('cut');
        }
    });
    this.copy = new gui.MenuItem({
        label: getMsg('Copy'),
        click: function() {
            document.execCommand('copy');
        }
    });
    this.paste = new gui.MenuItem({
        label: getMsg('Paste'),
        click: function() {
            // document.execCommand("selectAll");
            document.execCommand('paste');
        }
    });

    this.saveAs = new gui.MenuItem({
        label: getMsg('Save as'),
        click: function() {
            // document.execCommand("selectAll");
            // document.execCommand('paste');
            var src = $curTarget.attr('src');
            if(!src) {
            	alert(getMsg('Error'));
            	return;
            }
            // 得到图片, 打开dialog
            FileService.downloadImg(src, function(curPath) {
            	if(curPath) {
            		var paths = curPath.split(/\/|\\/);
            		var name = paths[paths.length-1] || "Untitled.png";
            		downloadImgPath = curPath;

            		// title不能设置
            		gui.dialog.showSaveDialog(gui.getCurrentWindow(), {title: name, defaultPath: name}, function(targetPath) {
            			if(targetPath) {

            				FileService.download(curPath, targetPath, function(ok, msg) {
								if(ok) {
									new window.Notification(getMsg('Info'), {
								        body: getMsg('Image saved successful!'),
								    });
								} else {
									new window.Notification(getMsg('Warning'), {
								        body: getMsg(msg || 'Image saved failure!'),
								    });
								}
							});
            			}
            			else {
            			}
            		});
            		
            	} else {
            		// alert会死?
            		// alert('File not exists');
            		// https://github.com/nwjs/nw.js/wiki/Notification
            		var notification = new window.Notification('Warning', {
				        body: getMsg('File not exists'),
				        // icon: appIcon
				    });
            	}
            });
        }
    });

    this.openInBrowser = new gui.MenuItem({
        label: getMsg('Open link in browser'),
        click: function() {
            // document.execCommand("selectAll");
            // document.execCommand('paste');
            // https://github.com/nwjs/nw.js/wiki/Shell
            openExternal(winHref);
        }
    });
    this.menu.append(this.cut);
    this.menu.append(this.copy);
    this.menu.append(this.paste);
    this.menu.append(gui.getSeparatorMenu());
    this.menu.append(this.saveAs);
    this.menu.append(gui.getSeparatorMenu());
    this.menu.append(this.openInBrowser);
}
Menu.prototype.canCopy = function(bool) {
    this.cut.enabled = bool;
    this.copy.enabled = bool;
};
Menu.prototype.canPaste = function(bool) {
    this.paste.enabled = bool;
};
Menu.prototype.canSaveAs = function(bool) {
    this.saveAs.enabled = bool;
};
Menu.prototype.canOpenInBroswer = function(bool) {
    this.openInBrowser.enabled = bool;
};
Menu.prototype.popup = function(x, y) {
    this.menu.popup(gui.getCurrentWindow(), x, y);
};
var menu = new Menu();

// 右键菜单
var winHref = '';
var $curTarget;
$('#noteTitle, #searchNoteInput, #searchNotebookForList, #addTagInput, #wmd-input, #preview-contents, #editorContent').on('contextmenu', function (e) {
	e.preventDefault();
	var $target = $(e.target);
	$curTarget = $target;
	var text = $target.text();
	winHref = $target.attr('href');
	if(!winHref) {
		winHref = text;
	}
	// 判断是否满足http://leanote.com
	if(winHref) {
		if (winHref.indexOf('http://127.0.0.1') < 0 && isURL(winHref)) {
		} else {
			winHref = false;
		}
	}

	menu.canOpenInBroswer(!!winHref);
	menu.canSaveAs($target.is('img') && $target.attr('src'));
	var selectionType = window.getSelection().type.toUpperCase();
	// var clipData = gui.Clipboard.get().get();
	// menu.canPaste(clipData.length > 0);
	menu.canPaste(true);
	menu.canCopy(selectionType === 'RANGE');
	menu.popup(e.originalEvent.x, e.originalEvent.y);
});