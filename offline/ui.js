const fs=require("fs");
const {ipcRenderer, remote}=require("electron");
const {dialog}=require("electron").remote;
window.$=window.jQuery=require("jquery");
init();

// function hello(){
//   var message=fs.readFileSync(__dirname+"/hello.txt", "utf8");
//   document.getElementById("hello").innerHTML=message;
// }
// window.addEventListener("load", hello);
//
//called from the main process when the user wants to open a file:
// ipcRenderer.on('openFile', function(event, message){
//   document.getElementById("hello").innerHTML=message.filePaths.join();
// });

function init(){
  //initiate the left menu:
  $("#leftmenu div.menuitem").first().addClass("current");
  changeTask();
  $("#leftmenu div.menuitem").on("click keyup", function(e){
    $("#leftmenu div.menuitem").removeClass("current");
    $(e.delegateTarget).addClass("current");
    changeTask();
  });

  //initiate the buttons:
  $("button.start").on("click", wantStart);
  $("button.abort").on("click", wantAbort);
  $("div.path button").on("click", function(e){ locateFile($(e.delegateTarget).closest(".path")); });
}

function changeTask(){
  var task=$("#leftmenu div.menuitem.current").attr("data-task");
  $(".block").each(function(){
    var $block=$(this);
    if($block.attr("data-task")!=task) $block.hide();
    else $block.fadeIn();
  });
}

function locateFile($pathDiv){
  var properties=["openFile", "createDirectory"];
  if($pathDiv.attr("data-mustexist")=="false") properties.push("promptToCreate");
  var ret=dialog.showOpenDialog(remote.getCurrentWindow(), {properties: properties});
  if(ret && ret.length && ret.length>0){
    var path=ret[0];
    $pathDiv.find("input").val(path);
  }
}

function messageToWorker(obj){
  ipcRenderer.send("message-to-worker", obj);
}
ipcRenderer.on("message-to-ui", (event, obj) => {
  if(obj.message=="started") started(obj);
  if(obj.message=="progressing") progressing(obj);
  if(obj.message=="aborted") aborted(obj);
  if(obj.message=="finished") finished(obj);
  if(obj.message=="error") error(obj);
});

function wantStart(){
  var obj={message: "want-start", task: $("div.block:visible").attr("data-task")};
  if(obj.task=="tbx-import"){
    obj.input=$("div.block:visible div.box div.path.input input").val();
    obj.output=$("div.block:visible div.box div.path.output input").val();
  }
  else if(obj.task=="tbx-export"){
    obj.input=$("div.block:visible div.box div.path.input input").val();
    obj.output=$("div.block:visible div.box div.path.output input").val();
  }
  messageToWorker(obj);
}
function started(obj){
  $("div#leftmenu").addClass("disabled");
  $("div.block:visible div.box").addClass("disabled");
  $("div.block:visible div.goline").removeClass("state-initial").addClass("state-ongoing").removeClass("state-finished").removeClass("state-error");
  updateThermometer(obj.done);
}
function wantAbort(){
  messageToWorker({message: "want-abort"});
}
function progressing(obj){
  updateThermometer(obj.done);
}
function aborted(obj){
  $("div#leftmenu").removeClass("disabled");
  $("div.block:visible div.box").removeClass("disabled");
  $("div.block:visible div.goline").addClass("state-initial").removeClass("state-ongoing").removeClass("state-finished").removeClass("state-error");
  updateThermometer(obj.done);
}
function finished(obj){
  $("div#leftmenu").removeClass("disabled");
  $("div.block:visible div.box").removeClass("disabled");
  $("div.block:visible div.goline").removeClass("state-initial").removeClass("state-ongoing").addClass("state-finished").removeClass("state-error");
  updateThermometer(obj.done);
}
function error(obj){
  $("div#leftmenu").removeClass("disabled");
  $("div.block:visible div.box").removeClass("disabled");
  $("div.block:visible div.goline").removeClass("state-initial").removeClass("state-ongoing").removeClass("state-finished").addClass("state-error");
  updateThermometer(obj.done);
  $("div.block:visible div.goline span.error").html(obj.error);
}

function updateThermometer(done){
  $("div.block:visible div.goline span.done").html(done.toString());
}
