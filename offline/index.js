const fs=require("fs");
const {ipcRenderer}=require('electron');

function hello(){
  var message=fs.readFileSync(__dirname+"/hello.txt", "utf8");
  document.getElementById("hello").innerHTML=message;
}
window.addEventListener("load", hello);

//called from the main process when the user wants to open a file:
ipcRenderer.on('openFile', function(event, message){
  document.getElementById("hello").innerHTML=message.filePaths.join();
});
