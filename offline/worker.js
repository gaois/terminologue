const fs=require("fs");
const {ipcRenderer}=require("electron");

const TBXExport=require("./tbx-export.js");

function messageToUI(obj){
  ipcRenderer.send("message-to-ui", obj);
}
ipcRenderer.on("message-to-worker", (event, obj) => {
  if(obj.task=="tbx-export"){
    if(obj.message=="want-start") TBXExport.start(obj.input, obj.output, messageToUI);
    if(obj.message=="want-abort") TBXExport.abort();
  }
});

//-------------------

var total=null, done=null, aborted=null;
function start(){
  total=345; done=0; aborted=false;
  messageToUI({message: "started", done: done});
  uptick();
}
function abort(){
  aborted=true;
  messageToUI({message: "aborted", done: done});
}
function uptick(){
  if(!aborted){
    done++;
    //if(done==112){ messageToUI({message: "error", done: done, error: "The output file does not exist."}); return; }
    if(done<total){
      messageToUI({message: "progressing", done: done});
      window.setTimeout(uptick, 10);
    } else {
      messageToUI({message: "finished", done: done});
    }
  }
}
