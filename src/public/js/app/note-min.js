Note.curNoteId="";Note.interval="";Note.itemIsBlog='<div class="item-blog"><i class="fa fa-bold" title="blog"></i></div><div class="item-setting"><i class="fa fa-cog" title="setting"></i></div>';Note.itemTplNoImg='<li href="#" class="item ?" noteId="?">';Note.itemTplNoImg+=Note.itemIsBlog+'<div class="item-desc"><p class="item-title">?</p><p class="item-info"><i class="fa fa-book"></i> <span class="note-notebook">?</span> <i class="fa fa-clock-o"></i> <span class="updated-time">?</span></p><p class="desc">?</p></div></li>';Note.itemTpl='<li href="#" class="item ? item-image" noteId="?"><div class="item-thumb" style=""><img src="?"/></div>';Note.itemTpl+=Note.itemIsBlog+'<div class="item-desc" style=""><p class="item-title">?</p><p class="item-info"><i class="fa fa-book"></i> <span class="note-notebook">?</span> <i class="fa fa-clock-o"></i> <span class="updated-time">?</span></p><p class="desc">?</p></div></li>';Note.newItemTpl='<li href="#" class="item item-active ?" fromUserId="?" noteId="?">';Note.newItemTpl+=Note.itemIsBlog+'<div class="item-desc" style="right: 0px;"><p class="item-title">?</p><p class="item-text"><i class="fa fa-book"></i> <span class="note-notebook">?</span> <i class="fa fa-clock-o"></i> <span class="updated-time">?</span><br /><span class="desc">?</span></p></div></li>';Note.noteItemListO=$("#noteItemList");Note.cacheByNotebookId={all:{}};Note.notebookIds={};Note.isReadOnly=false;Note.intervalTime=6e5;Note.startInterval=function(){Note.interval=setInterval(function(){log("自动保存开始...");changedNote=Note.curChangedSaveIt(false)},Note.intervalTime)};Note.stopInterval=function(){clearInterval(Note.interval);setTimeout(function(){Note.startInterval()},Note.intervalTime)};Note.addNoteCache=function(note){Note.cache[note.NoteId]=note;Note.clearCacheByNotebookId(note.NotebookId)};Note.setNoteCache=function(content,clear){if(!Note.cache[content.NoteId]){Note.cache[content.NoteId]=content}else{$.extend(Note.cache[content.NoteId],content)}if(clear==undefined){clear=true}if(clear){Note.clearCacheByNotebookId(content.NotebookId)}};Note.getCurNote=function(){var self=this;if(self.curNoteId==""){return null}return self.cache[self.curNoteId]};Note.getNote=function(noteId){var self=this;return self.cache[noteId]};Note.clearCacheByNotebookId=function(notebookId){if(notebookId){Note.cacheByNotebookId[notebookId]={};Note.cacheByNotebookId["all"]={};Note.notebookIds[notebookId]=true}};Note.notebookHasNotes=function(notebookId){var notes=Note.getNotesByNotebookId(notebookId);return!isEmpty(notes)};Note.getNotesByNotebookId=function(notebookId,sortBy,isAsc){if(!sortBy){sortBy="UpdatedTime"}if(isAsc=="undefined"){isAsc=false}if(!notebookId){notebookId="all"}if(!Note.cacheByNotebookId[notebookId]){return[]}if(Note.cacheByNotebookId[notebookId][sortBy]){return Note.cacheByNotebookId[notebookId][sortBy]}else{}var notes=[];var sortBys=[];for(var i in Note.cache){if(!i){continue}var note=Note.cache[i];if(note.IsTrash||note.IsShared){continue}if(notebookId=="all"||note.NotebookId==notebookId){notes.push(note)}}notes.sort(function(a,b){var t1=a[sortBy];var t2=b[sortBy];if(isAsc){if(t1<t2){return-1}else if(t1>t2){return 1}}else{if(t1<t2){return 1}else if(t1>t2){return-1}}return 0});Note.cacheByNotebookId[notebookId][sortBy]=notes;return notes};Note.curNoteIsDirtied=function(){var me=this;var note=me.getCurNote();if(note){note.isDirty=true}};Note.renderNotesAndFirstOneContent=function(ret){if(!isArray(ret)){return}Note.renderNotes(ret);if(!isEmpty(ret[0])){Note.changeNoteForPjax(ret[0].NoteId,true,false)}else{}};Note.curHasChanged=function(force){if(force==undefined){force=true}var cacheNote=Note.cache[Note.curNoteId]||{};var title=$("#noteTitle").val();var tags=Tag.getTags();var contents=getEditorContent(cacheNote.IsMarkdown);var content,preview;var contentText;if(isArray(contents)){content=contents[0];preview=contents[1];contentText=content;if(content&&previewIsEmpty(preview)&&Converter){preview=Converter.makeHtml(content)}if(!content){preview=""}cacheNote.Preview=preview}else{content=contents;try{contentText=$(content).text()}catch(e){}}var hasChanged={hasChanged:false,IsNew:cacheNote.IsNew,IsMarkdown:cacheNote.IsMarkdown,FromUserId:cacheNote.FromUserId,NoteId:cacheNote.NoteId,NotebookId:cacheNote.NotebookId,Version:cacheNote.Version||0};if(hasChanged.IsNew){$.extend(hasChanged,cacheNote)}else{if(!cacheNote.isDirty){log("no dirty");hasChanged.hasChanged=false;return hasChanged}}if(cacheNote.Title!=title){hasChanged.hasChanged=true;hasChanged.Title=title;if(!hasChanged.Title){}}if(!arrayEqual(cacheNote.Tags,tags)){hasChanged.hasChanged=true;hasChanged.Tags=tags}if(force&&cacheNote.Content!=content||!force&&(!cacheNote.IsMarkdown&&$(cacheNote.Content).text()!=contentText||cacheNote.IsMarkdown&&cacheNote.Content!=contentText)){hasChanged.hasChanged=true;hasChanged.Content=content;var c=preview||content;if(!cacheNote.HasSelfDefined||!cacheNote.IsBlog){hasChanged.Desc=Note.genDesc(c);hasChanged.ImgSrc=Note.getImgSrc(c);hasChanged.Abstract=Note.genAbstract(c)}}else{log("text相同");log(cacheNote.Content==content)}hasChanged["UserId"]=cacheNote["UserId"]||"";return hasChanged};Note.genDesc=function(content){if(!content){return""}content=content.replace(/<br \/>/g," <br />");content=content.replace(/<\/p>/g," </p>");content=content.replace(/<\/div>/g," </div>");content=$("<div></div>").html(content).text();content=content.replace(/</g,"&lt;");content=content.replace(/>/g,"&gt;");if(content.length<300){return content}return content.substring(0,300)};Note.genAbstract=function(content,len){if(!content){return""}if(len==undefined){len=1e3}if(content.length<len){return content}var isCode=false;var isHTML=false;var n=0;var result="";var maxLen=len;for(var i=0;i<content.length;++i){var temp=content[i];if(temp=="<"){isCode=true}else if(temp=="&"){isHTML=true}else if(temp==">"&&isCode){n=n-1;isCode=false}else if(temp==";"&&isHTML){isHTML=false}if(!isCode&&!isHTML){n=n+1}result+=temp;if(n>=maxLen){break}}var d=document.createElement("div");d.innerHTML=result;return d.innerHTML};Note.getImgSrc=function(content){if(!content){return""}var imgs=$(content).find("img");for(var i in imgs){var src=imgs.eq(i).attr("src");if(src){return src}}return""};Note.saveInProcess={};Note.savePool={};Note.curChangedSaveIt=function(force){var me=this;if(!Note.curNoteId||Note.isReadOnly){return}var hasChanged=Note.curHasChanged(force);if(hasChanged.hasChanged||hasChanged.IsNew){Note.renderChangedNote(hasChanged);delete hasChanged.hasChanged;Note.setNoteCache(hasChanged,false);Note.setNoteCache({NoteId:hasChanged.NoteId,UpdatedTime:(new Date).format("yyyy-MM-ddThh:mm:ss.S")},false);showMsg(getMsg("saving"));me.saveInProcess[hasChanged.NoteId]=true;ajaxPost("/note/updateNoteOrContent",hasChanged,function(ret){me.saveInProcess[hasChanged.NoteId]=false;if(hasChanged.IsNew){ret.IsNew=false;Note.setNoteCache(ret,false);Pjax.changeNote(ret)}showMsg(getMsg("saveSuccess"),1e3)});return hasChanged}return false};Note.updatePoolNote=function(){var me=this;for(var noteId in me.savePool){if(!noteId){continue}delete me.savePool[noteId];var hasChanged=me.savePool[noteId];me.saveInProcess[noteId]=true;ajaxPost("/note/updateNoteOrContent",hasChanged,function(ret){me.saveInProcess[noteId]=false})}};Note.updatePoolNoteInterval=null;Note.startUpdatePoolNoteInterval=function(){return;var me=this;if(me.updatePoolNoteInterval){return}me.updatePoolNoteInterval=setTimeout(function(){log("update pool");me.updatePoolNote()},1e3)};Note.selectTarget=function(target){$(".item").removeClass("item-active");$(target).addClass("item-active")};Note.showContentLoading=function(){$("#noteMaskForLoading").css("z-index",99999)};Note.hideContentLoading=function(){$("#noteMaskForLoading").css("z-index",-1)};Note.directToNote=function(noteId){var $p=$("#noteItemList");var pHeight=$p.height();var pTop=$("[noteId='"+noteId+"']").position().top;var scrollTop=$p.scrollTop();pTop+=scrollTop;if(pTop>=scrollTop&&pTop<=pHeight+scrollTop){}else{var top=pTop;log("定位到特定note, 在可视范围内");if(!LEA.isMobile&&!Mobile.isMobile()){$("#noteItemList").scrollTop(top);$("#noteItemList").slimScroll({scrollTo:top+"px",height:"100%",onlyScrollBar:true})}else{}}};Note.changeNoteForPjax=function(noteId,mustPush,needTargetNotebook){var me=this;var note=me.getNote(noteId);if(!note){return}var isShare=note.Perm!=undefined;if(needTargetNotebook==undefined){needTargetNotebook=true}me.changeNote(noteId,isShare,true,function(note){if(mustPush==undefined){mustPush=true}if(mustPush){Pjax.changeNote(note)}if(needTargetNotebook){Note.directToNote(noteId)}});if(needTargetNotebook){if(isShare){if($("#myShareNotebooks").hasClass("closed")){$("#myShareNotebooks .folderHeader").trigger("click")}}else{if($("#myNotebooks").hasClass("closed")){$("#myNotebooks .folderHeader").trigger("click")}}Notebook.expandNotebookTo(note.NotebookId)}};Note.contentAjax=null;Note.contentAjaxSeq=1;Note.changeNote=function(selectNoteId,isShare,needSaveChanged,callback){var self=this;Note.stopInterval();var target=$(tt('[noteId="?"]',selectNoteId));Note.selectTarget(target);if(needSaveChanged==undefined){needSaveChanged=true}if(needSaveChanged){var changedNote=Note.curChangedSaveIt()}Note.curNoteId="";var cacheNote=Note.cache[selectNoteId];if(!isShare){if(cacheNote.Perm!=undefined){isShare=true}}var hasPerm=!isShare||Share.hasUpdatePerm(selectNoteId);if(hasPerm){Note.hideReadOnly();Note.renderNote(cacheNote);switchEditor(cacheNote.IsMarkdown)}else{Note.renderNoteReadOnly(cacheNote)}Attach.renderNoteAttachNum(selectNoteId,true);Note.contentAjaxSeq++;var seq=Note.contentAjaxSeq;function setContent(ret){Note.contentAjax=null;if(seq!=Note.contentAjaxSeq){return}Note.setNoteCache(ret,false);ret=Note.cache[selectNoteId];if(hasPerm){Note.renderNoteContent(ret)}else{Note.renderNoteContentReadOnly(ret)}self.hideContentLoading();callback&&callback(ret)}if(cacheNote.Content){setContent(cacheNote);return}var url="/note/getNoteContent";var param={noteId:selectNoteId};if(isShare){url="/share/getShareNoteContent";param.sharedUserId=cacheNote.UserId}self.showContentLoading();if(Note.contentAjax!=null){Note.contentAjax.abort()}Note.contentAjax=ajaxGet(url,param,setContent)};Note.renderChangedNote=function(changedNote){if(!changedNote){return}var $leftNoteNav=$(tt('[noteId="?"]',changedNote.NoteId));if(changedNote.Title){$leftNoteNav.find(".item-title").html(changedNote.Title)}if(changedNote.Desc){$leftNoteNav.find(".desc").html(changedNote.Desc)}if(changedNote.ImgSrc){$thumb=$leftNoteNav.find(".item-thumb");if($thumb.length>0){$thumb.find("img").attr("src",changedNote.ImgSrc)}else{$leftNoteNav.append(tt('<div class="item-thumb" style=""><img src="?"></div>',changedNote.ImgSrc));$leftNoteNav.addClass("item-image")}$leftNoteNav.find(".item-desc").removeAttr("style")}else if(changedNote.ImgSrc==""){$leftNoteNav.find(".item-thumb").remove();$leftNoteNav.removeClass("item-image")}};Note.clearNoteInfo=function(){Note.curNoteId="";Tag.clearTags();$("#noteTitle").val("");setEditorContent("");$("#noteRead").hide()};Note.clearNoteList=function(){Note.noteItemListO.html("")};Note.clearAll=function(){Note.curNoteId="";Note.clearNoteInfo();Note.clearNoteList()};Note.renderNote=function(note){if(!note){return}$("#noteTitle").val(note.Title);Tag.renderTags(note.Tags);note.isDirty=false};Note.renderNoteContent=function(content){setEditorContent(content.Content,content.IsMarkdown,content.Preview);Note.curNoteId=content.NoteId};Note.showEditorMask=function(){$("#editorMask").css("z-index",10).show();if(Notebook.curNotebookIsTrashOrAll()){$("#editorMaskBtns").hide();$("#editorMaskBtnsEmpty").show()}else{$("#editorMaskBtns").show();$("#editorMaskBtnsEmpty").hide()}};Note.hideEditorMask=function(){$("#editorMask").css("z-index",-10).hide()};Note.renderNotesC=0;Note.renderNotes=function(notes,forNewNote,isShared){var renderNotesC=++Note.renderNotesC;if(!LEA.isMobile&&!Mobile.isMobile()){$("#noteItemList").slimScroll({scrollTo:"0px",height:"100%",onlyScrollBar:true})}if(!notes||typeof notes!="object"||notes.length<=0){if(!forNewNote){Note.showEditorMask()}return}Note.hideEditorMask();if(forNewNote==undefined){forNewNote=false}if(!forNewNote){Note.noteItemListO.html("")}var len=notes.length;var c=Math.ceil(len/20);Note._renderNotes(notes,forNewNote,isShared,1);for(var i=0;i<len;++i){var note=notes[i];Note.setNoteCache(note,false);if(isShared){Share.setCache(note)}}for(var i=1;i<c;++i){setTimeout(function(i){return function(){if(renderNotesC==Note.renderNotesC){Note._renderNotes(notes,forNewNote,isShared,i+1)}}}(i),i*2e3)}};Note._renderNotes=function(notes,forNewNote,isShared,tang){var baseClasses="item-my";if(isShared){baseClasses="item-shared"}var len=notes.length;for(var i=(tang-1)*20;i<len&&i<tang*20;++i){var classes=baseClasses;if(!forNewNote&&i==0){classes+=" item-active"}var note=notes[i];var tmp;if(note.ImgSrc){tmp=tt(Note.itemTpl,classes,note.NoteId,note.ImgSrc,note.Title,Notebook.getNotebookTitle(note.NotebookId),goNowToDatetime(note.UpdatedTime),note.Desc)}else{tmp=tt(Note.itemTplNoImg,classes,note.NoteId,note.Title,Notebook.getNotebookTitle(note.NotebookId),goNowToDatetime(note.UpdatedTime),note.Desc)}if(!note.IsBlog){tmp=$(tmp);tmp.find(".item-blog").hide()}Note.noteItemListO.append(tmp)}};Note.newNote=function(notebookId,isShare,fromUserId,isMarkdown){switchEditor(isMarkdown);Note.hideEditorMask();Note.hideReadOnly();Note.stopInterval();Note.curChangedSaveIt();var note={NoteId:getObjectId(),Title:"",Tags:[],Content:"",NotebookId:notebookId,IsNew:true,FromUserId:fromUserId,IsMarkdown:isMarkdown};Note.addNoteCache(note);Attach.clearNoteAttachNum();var newItem="";var baseClasses="item-my";if(isShare){baseClasses="item-shared"}var notebook=Notebook.getNotebook(notebookId);var notebookTitle=notebook?notebook.Title:"";var curDate=getCurDate();if(isShare){newItem=tt(Note.newItemTpl,baseClasses,fromUserId,note.NoteId,note.Title,notebookTitle,curDate,"")}else{newItem=tt(Note.newItemTpl,baseClasses,"",note.NoteId,note.Title,notebookTitle,curDate,"")}if(!notebook.IsBlog){newItem=$(newItem);newItem.find(".item-blog").hide()}if(!Notebook.isCurNotebook(notebookId)){Note.clearAll();Note.noteItemListO.prepend(newItem);if(!isShare){Notebook.changeNotebookForNewNote(notebookId)}else{Share.changeNotebookForNewNote(notebookId)}}else{Note.noteItemListO.prepend(newItem)}Note.selectTarget($(tt('[noteId="?"]',note.NoteId)));$("#noteTitle").focus();Note.renderNote(note);Note.renderNoteContent(note);Note.curNoteId=note.NoteId;Notebook.incrNotebookNumberNotes(notebookId)};Note.saveNote=function(e){var num=e.which?e.which:e.keyCode;if((e.ctrlKey||e.metaKey)&&num==83){Note.curChangedSaveIt();e.preventDefault();return false}else{}};Note.changeToNext=function(target){var $target=$(target);var next=$target.next();if(!next.length){var prev=$target.prev();if(prev.length){next=prev}else{Note.showEditorMask();return}}Note.changeNote(next.attr("noteId"))};Note.deleteNote=function(target,contextmenuItem,isShared){if($(target).hasClass("item-active")){Note.stopInterval();Note.curNoteId=null;Note.clearNoteInfo()}noteId=$(target).attr("noteId");if(!noteId){return}$(target).hide();var note=Note.cache[noteId];var url="/note/deleteNote";if(note.IsTrash){url="/note/deleteTrash"}else{Notebook.minusNotebookNumberNotes(note.NotebookId)}ajaxGet(url,{noteId:noteId,userId:note.UserId,isShared:isShared},function(ret){if(ret){Note.changeToNext(target);$(target).remove();if(note){Note.clearCacheByNotebookId(note.NotebookId);delete Note.cache[noteId]}showMsg("删除成功!",500)}else{$(target).show();showMsg("删除失败!",2e3)}})};Note.listNoteShareUserInfo=function(target){var noteId=$(target).attr("noteId");showDialogRemote("/share/listNoteShareUserInfo",{noteId:noteId})};Note.shareNote=function(target){var title=$(target).find(".item-title").text();showDialog("dialogShareNote",{title:getMsg("shareToFriends")+"-"+title});setTimeout(function(){$("#friendsEmail").focus()},500);var noteId=$(target).attr("noteId");shareNoteOrNotebook(noteId,true)};Note.listNoteContentHistories=function(){$("#leanoteDialog #modalTitle").html(getMsg("history"));$content=$("#leanoteDialog .modal-body");$content.html("");$("#leanoteDialog .modal-footer").html('<button type="button" class="btn btn-default" data-dismiss="modal">'+getMsg("close")+"</button>");options={};options.show=true;$("#leanoteDialog").modal(options);ajaxGet("/noteContentHistory/listHistories",{noteId:Note.curNoteId},function(re){if(!isArray(re)){$content.html(getMsg("noHistories"));return}var str="<p>"+getMsg("historiesNum")+'</p><div id="historyList"><table class="table table-hover">';note=Note.cache[Note.curNoteId];var s="div";if(note.IsMarkdown){s="pre"}for(i in re){var content=re[i];content.Ab=Note.genAbstract(content.Content,200);str+=tt('<tr><td seq="?">#?<? class="each-content">?</?> <div class="btns">'+getMsg("datetime")+': <span class="label label-default">?</span> <button class="btn btn-default all">'+getMsg("unfold")+'</button> <button class="btn btn-primary back">'+getMsg("restoreFromThisVersion")+"</button></div></td></tr>",i,+i+1,s,content.Ab,s,goNowToDatetime(content.UpdatedTime))}str+="</table></div>";$content.html(str);$("#historyList .all").click(function(){$p=$(this).parent().parent();var seq=$p.attr("seq");var $c=$p.find(".each-content");var info=re[seq];if(!info.unfold){$(this).text(getMsg("fold"));$c.html(info.Content);info.unfold=true}else{$(this).text(getMsg("unfold"));$c.html(info.Ab);info.unfold=false}});$("#historyList .back").click(function(){$p=$(this).parent().parent();var seq=$p.attr("seq");if(confirm(getMsg("confirmBackup"))){Note.curChangedSaveIt();note=Note.cache[Note.curNoteId];setEditorContent(re[seq].Content,note.IsMarkdown);hideDialog()}})})};Note.exportPDF=function(target){var noteId=$(target).attr("noteId");ajaxGet("/note/exportPdf",{noteId:noteId},function(ret){})};Note.html2Image=function(target){var noteId=$(target).attr("noteId");showDialog("html2ImageDialog",{title:"分享到社区",postShow:function(){ajaxGet("/note/html2Image",{noteId:noteId},function(ret){if(typeof ret=="object"&&ret.Ok){$("#leanoteDialog .weibo span").html("生成成功, 右键图片保存到本地.");$("#leanoteDialog .weibo img").attr("src",ret.Id+"?"+(new Date).getTime());$("#leanoteDialog .btn-share").removeClass("disabled");var note=Note.cache[noteId];var pic=UrlPrefix+ret.Id;var title=encodeURI(note.Title+" ("+UserInfo.Username+"分享. 来自leanote.com)");var windowParam="width=700, height=580, top=180, left=320, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no";$("#leanoteDialog .sendWeiboBtn").click(function(){var url="http://service.weibo.com/share/share.php?title="+title;url+="&pic="+pic;window.open(url,"分享到新浪微博",windowParam)});$("#leanoteDialog .sendTxWeiboBtn").click(function(){var _appkey="801542571";var url="http://share.v.t.qq.com/index.php?c=share&a=index&appkey="+_appkey+"&title="+title+"&url=&pic="+pic;window.open(url,"分享到腾讯微博",windowParam)});$("#leanoteDialog .sendQQBtn").click(function(){var url="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+UrlPrefix+"&title="+title+"&pics="+pic;window.open(url,"分享QQ空间",windowParam)});$("#leanoteDialog .sendRRBtn").click(function(){var url="http://widget.renren.com/dialog/share?resourceUrl="+UrlPrefix+"&srcUrl="+UrlPrefix+"&title="+title+"&pic="+pic;window.open(url,"分享人人网",windowParam)})}else{$("#leanoteDialog .weibo").html("对不起, 我们出错了!")}})}})};Note.showReadOnly=function(){Note.isReadOnly=true;$("#noteRead").show()};Note.hideReadOnly=function(){Note.isReadOnly=false;$("#noteRead").hide()};Note.renderNoteReadOnly=function(note){Note.showReadOnly();$("#noteReadTitle").html(note.Title);Tag.renderReadOnlyTags(note.Tags);$("#noteReadCreatedTime").html(goNowToDatetime(note.CreatedTime));$("#noteReadUpdatedTime").html(goNowToDatetime(note.UpdatedTime))};Note.renderNoteContentReadOnly=function(note){if(note.IsMarkdown){$("#noteReadContent").html('<pre id="readOnlyMarkdown">'+note.Content+"</pre>")}else{$("#noteReadContent").html(note.Content)}};Note.lastSearch=null;Note.lastKey=null;Note.lastSearchTime=new Date;Note.isOver2Seconds=false;Note.isSameSearch=function(key){var now=new Date;var duration=now.getTime()-Note.lastSearchTime.getTime();Note.isOver2Seconds=duration>2e3?true:false;if(!Note.lastKey||Note.lastKey!=key||duration>1e3){Note.lastKey=key;Note.lastSearchTime=now;return false}if(key==Note.lastKey){return true}Note.lastSearchTime=now;Note.lastKey=key;return false};Note.searchNote=function(){var val=$("#searchNoteInput").val();if(!val){Notebook.changeNotebook("0");return}if(Note.isSameSearch(val)){return}if(Note.lastSearch){Note.lastSearch.abort()}Note.curChangedSaveIt();Note.clearAll();showLoading();Note.lastSearch=$.post("/note/searchNote",{key:val},function(notes){hideLoading();if(notes){Note.lastSearch=null;Note.renderNotes(notes);if(!isEmpty(notes)){Note.changeNote(notes[0].NoteId,false)}}else{}})};Note.setNote2Blog=function(target){var noteId=$(target).attr("noteId");var note=Note.cache[noteId];var isBlog=true;if(note.IsBlog!=undefined){isBlog=!note.IsBlog}if(isBlog){$(target).find(".item-blog").show()}else{$(target).find(".item-blog").hide()}ajaxPost("/note/setNote2Blog",{noteId:noteId,isBlog:isBlog},function(ret){if(ret){Note.setNoteCache({NoteId:noteId,IsBlog:isBlog},false)}})};Note.setAllNoteBlogStatus=function(notebookId,isBlog){if(!notebookId){return}var notes=Note.getNotesByNotebookId(notebookId);if(!isArray(notes)){return}var len=notes.length;if(len==0){for(var i in Note.cache){if(Note.cache[i].NotebookId==notebookId){Note.cache[i].IsBlog=isBlog}}}else{for(var i=0;i<len;++i){notes[i].IsBlog=isBlog}}};Note.moveNote=function(target,data){var noteId=$(target).attr("noteId");var note=Note.cache[noteId];var notebookId=data.notebookId;if(!note.IsTrash&&note.NotebookId==notebookId){return}Notebook.incrNotebookNumberNotes(notebookId);if(!note.IsTrash){Notebook.minusNotebookNumberNotes(note.NotebookId)}ajaxGet("/note/moveNote",{noteId:noteId,notebookId:notebookId},function(ret){if(ret&&ret.NoteId){if(note.IsTrash){Note.changeToNext(target);$(target).remove();Note.clearCacheByNotebookId(notebookId)}else{if(!Notebook.curActiveNotebookIsAll()){Note.changeToNext(target);if($(target).hasClass("item-active")){Note.clearNoteInfo()}$(target).remove()}else{$(target).find(".note-notebook").html(Notebook.getNotebookTitle(notebookId))}Note.clearCacheByNotebookId(note.NotebookId);Note.clearCacheByNotebookId(notebookId)}Note.setNoteCache(ret)}})};Note.copyNote=function(target,data,isShared){var noteId=$(target).attr("noteId");var note=Note.cache[noteId];var notebookId=data.notebookId;if(note.IsTrash||note.NotebookId==notebookId){return}var url="/note/copyNote";var data={noteId:noteId,notebookId:notebookId};if(isShared){url="/note/copySharedNote";data.fromUserId=note.UserId}ajaxGet(url,data,function(ret){if(ret&&ret.NoteId){Note.clearCacheByNotebookId(notebookId);Note.setNoteCache(ret)}});Notebook.incrNotebookNumberNotes(notebookId)};Note.getContextNotebooks=function(notebooks){var moves=[];var copys=[];var copys2=[];for(var i in notebooks){var notebook=notebooks[i];var move={text:notebook.Title,notebookId:notebook.NotebookId,action:Note.moveNote};var copy={text:notebook.Title,notebookId:notebook.NotebookId,action:Note.copyNote};var copy2={text:notebook.Title,notebookId:notebook.NotebookId,action:Share.copySharedNote};if(!isEmpty(notebook.Subs)){var mc=Note.getContextNotebooks(notebook.Subs);move.items=mc[0];copy.items=mc[1];copy2.items=mc[2];move.type="group";move.width=150;copy.type="group";copy.width=150;copy2.type="group";copy2.width=150}moves.push(move);copys.push(copy);copys2.push(copy2)}return[moves,copys,copys2]};Note.contextmenu=null;Note.notebooksCopy=[];Note.initContextmenu=function(){var self=Note;if(Note.contextmenu){Note.contextmenu.destroy()}var notebooks=Notebook.everNotebooks;var mc=self.getContextNotebooks(notebooks);var notebooksMove=mc[0];var notebooksCopy=mc[1];self.notebooksCopy=mc[2];var noteListMenu={width:180,items:[{text:getMsg("shareToFriends"),alias:"shareToFriends",icon:"",faIcon:"fa-share-square-o",action:Note.listNoteShareUserInfo},{type:"splitLine"},{text:getMsg("publicAsBlog"),alias:"set2Blog",faIcon:"fa-bold",action:Note.setNote2Blog},{text:getMsg("cancelPublic"),alias:"unset2Blog",faIcon:"fa-undo",action:Note.setNote2Blog},{type:"splitLine"},{text:getMsg("delete"),icon:"",faIcon:"fa-trash-o",action:Note.deleteNote},{text:getMsg("move"),alias:"move",faIcon:"fa-arrow-right",type:"group",width:180,items:notebooksMove},{text:getMsg("copy"),alias:"copy",icon:"",faIcon:"fa-copy",type:"group",width:180,items:notebooksCopy}],onShow:applyrule,onContextMenu:beforeContextMenu,parent:"#noteItemList",children:".item-my"};function menuAction(target){showDialog("dialogUpdateNotebook",{title:"修改笔记本",postShow:function(){}})}function applyrule(menu){var noteId=$(this).attr("noteId");var note=Note.cache[noteId];if(!note){return}var items=[];if(note.IsTrash){items.push("shareToFriends");items.push("shareStatus");items.push("unset2Blog");items.push("set2Blog");items.push("copy")}else{if(!note.IsBlog){items.push("unset2Blog")}else{items.push("set2Blog")}var notebookTitle=Notebook.getNotebookTitle(note.NotebookId);items.push("move."+notebookTitle);items.push("copy."+notebookTitle)}menu.applyrule({name:"target..",disable:true,items:items})}function beforeContextMenu(){return this.id!="target3"}Note.contextmenu=$("#noteItemList .item-my").contextmenu(noteListMenu)};var Attach={loadedNoteAttachs:{},attachsMap:{},init:function(){var self=this;$("#showAttach").click(function(){self.renderAttachs(Note.curNoteId)});self.attachListO.click(function(e){e.stopPropagation()});self.attachListO.on("click",".delete-attach",function(e){e.stopPropagation();var attachId=$(this).closest("li").data("id");var t=this;if(confirm("Are you sure to delete it ?")){$(t).button("loading");ajaxPost("/attach/deleteAttach",{attachId:attachId},function(re){$(t).button("reset");if(reIsOk(re)){self.deleteAttach(attachId)}else{alert(re.Msg)}})}});self.attachListO.on("click",".download-attach",function(e){e.stopPropagation();var attachId=$(this).closest("li").data("id");window.open(UrlPrefix+"/attach/download?attachId="+attachId)});self.downloadAllBtnO.click(function(){window.open(UrlPrefix+"/attach/downloadAll?noteId="+Note.curNoteId)});self.attachListO.on("click",".link-attach",function(e){e.stopPropagation();var attachId=$(this).closest("li").data("id");var attach=self.attachsMap[attachId];var src=UrlPrefix+"/attach/download?attachId="+attachId;if(LEA.isMarkdownEditor()&&MD){MD.insertLink(src,attach.Title)}else{tinymce.activeEditor.insertContent('<a target="_blank" href="'+src+'">'+attach.Title+"</a>")}});self.linkAllBtnO.on("click",function(e){e.stopPropagation();var note=Note.getCurNote();if(!note){return}var src=UrlPrefix+"/attach/downloadAll?noteId="+Note.curNoteId;var title=note.Title?note.Title+".tar.gz":"all.tar.gz";if(LEA.isMarkdownEditor()&&MD){MD.insertLink(src,title)}else{tinymce.activeEditor.insertContent('<a target="_blank" href="'+src+'">'+title+"</a>")}})},attachListO:$("#attachList"),attachNumO:$("#attachNum"),attachDropdownO:$("#attachDropdown"),downloadAllBtnO:$("#downloadAllBtn"),linkAllBtnO:$("#linkAllBtn"),clearNoteAttachNum:function(){var self=this;self.attachNumO.html("").hide()},renderNoteAttachNum:function(noteId,needHide){var self=this;var note=Note.getNote(noteId);if(note.AttachNum){self.attachNumO.html("("+note.AttachNum+")").show();self.downloadAllBtnO.show();self.linkAllBtnO.show()}else{self.attachNumO.hide();self.downloadAllBtnO.hide();self.linkAllBtnO.hide()}if(needHide){self.attachDropdownO.removeClass("open")}},_renderAttachs:function(attachs){var self=this;var html="";var attachNum=attachs.length;for(var i=0;i<attachNum;++i){var each=attachs[i];html+='<li class="clearfix" data-id="'+each.AttachId+'">'+'<div class="attach-title">'+each.Title+"</div>"+'<div class="attach-process"> '+'	  <button class="btn btn-sm btn-warning delete-attach" data-loading-text="..."><i class="fa fa-trash-o"></i></button> '+'	  <button type="button" class="btn btn-sm btn-primary download-attach"><i class="fa fa-download"></i></button> '+'	  <button type="button" class="btn btn-sm btn-default link-attach" title="Insert link into content"><i class="fa fa-link"></i></button> '+"</div>"+"</li>";self.attachsMap[each.AttachId]=each}self.attachListO.html(html);var note=Note.getCurNote();if(note){note.AttachNum=attachNum;self.renderNoteAttachNum(note.NoteId,false)}},renderAttachs:function(noteId){var self=this;if(self.loadedNoteAttachs[noteId]){self._renderAttachs(self.loadedNoteAttachs[noteId]);return}self.attachListO.html('<li class="loading"><img src="/images/loading-24.gif"/></li>');ajaxGet("/attach/getAttachs",{noteId:noteId},function(ret){var list=[];if(ret.Ok){list=ret.List;if(!list){list=[]}}self.loadedNoteAttachs[noteId]=list;self._renderAttachs(list)})},addAttach:function(attachInfo){var self=this;if(!self.loadedNoteAttachs[attachInfo.NoteId]){self.loadedNoteAttachs[attachInfo.NoteId]=[]}self.loadedNoteAttachs[attachInfo.NoteId].push(attachInfo);self.renderAttachs(attachInfo.NoteId)},deleteAttach:function(attachId){var self=this;var noteId=Note.curNoteId;var attachs=self.loadedNoteAttachs[noteId];for(var i=0;i<attachs.length;++i){if(attachs[i].AttachId==attachId){attachs.splice(i,1);break}}self.renderAttachs(noteId)},downloadAttach:function(fileId){var self=this},downloadAll:function(){}};$(function(){Attach.init();$("#noteItemList").on("mouseenter",".item",function(event){if(LEA.isIpad||LEA.isIphone){$(this).trigger("click")}});$("#noteItemList").on("click",".item",function(event){event.stopPropagation();var noteId=$(this).attr("noteId");Mobile.changeNote(noteId);if(!noteId){return}if(Note.curNoteId!=noteId){Note.changeNoteForPjax(noteId,true,false)}});$("#editorContent, #wmd-input, #noteTitle").keyup(function(){Note.curNoteIsDirtied()});$("#newNoteBtn, #editorMask .note").click(function(){var notebookId=$("#curNotebookForNewNote").attr("notebookId");Note.newNote(notebookId)});$("#newNoteMarkdownBtn, #editorMask .markdown").click(function(){var notebookId=$("#curNotebookForNewNote").attr("notebookId");Note.newNote(notebookId,false,"",true)});$("#notebookNavForNewNote").on("click","li div",function(){var notebookId=$(this).attr("notebookId");if($(this).hasClass("new-note-right")){Note.newNote(notebookId,false,"",true)}else{Note.newNote(notebookId)}});$("#searchNotebookForAdd").click(function(e){e.stopPropagation()});$("#searchNotebookForAdd").keyup(function(){var key=$(this).val();Notebook.searchNotebookForAddNote(key)});$("#searchNotebookForList").keyup(function(){var key=$(this).val();Notebook.searchNotebookForList(key)});$("#searchNoteInput").on("keydown",function(e){var theEvent=e;if(theEvent.keyCode==13||theEvent.keyCode==108){theEvent.preventDefault();Note.searchNote();return false}});$("#contentHistory").click(function(){Note.listNoteContentHistories()});$("#saveBtn").click(function(){Note.curChangedSaveIt(true)});$("#noteItemList").on("click",".item-blog",function(e){e.preventDefault();e.stopPropagation();var noteId=$(this).parent().attr("noteId");window.open("/blog/view/"+noteId)});$("#noteItemList").on("click",".item-my .item-setting",function(e){e.preventDefault();e.stopPropagation();var $p=$(this).parent();Note.contextmenu.showMenu(e,$p)})});Note.startInterval();