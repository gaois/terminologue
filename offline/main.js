const {app, dialog, BrowserWindow, Menu, MenuItem, ipcMain}=require("electron");
var uiWindow=null;
var workerWindow=null;

function createWindows(){
  //create the visible UI window:
  uiWindow=new BrowserWindow({
    title: app.getName(),
    icon: __dirname+"/appicon/appicon.png",
    backgroundColor: "#dee7e6",
    show: false,
    width: 1400,
    height: 600,
    center: true,
    webPreferences: {
      nodeIntegration: true
    },
  });
  Menu.setApplicationMenu(buildMenu());
  uiWindow.on("closed", function(){
    app.quit();
  });
  uiWindow.loadFile(__dirname+"/ui.html");
  uiWindow.once("ready-to-show", () => {
    uiWindow.show();
  });
  //create the hidden worker window:
  workerWindow=new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    },
  });
  workerWindow.loadFile(__dirname+"/worker.html");
}

//buils and returns the applications menu:
function buildMenu(){
  return Menu.buildFromTemplate([
    {
      label: 'App',
      submenu: [
        { role: 'quit', label: "Quit" }
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'zoomin', label: "Zoom in" },
        { role: 'zoomout', label: "Zoom out"},
        { role: 'resetzoom', label: "Reset zoom" },
        { type: 'separator' },
        { role: 'toggledevtools', label: "Developer tools" },
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click () { require('electron').shell.openExternalSync('https://www.terminologue.org/') }
        }
      ]
    },
  ]);
};

//called wheh the user click File > Open in the menu:
function openFile(){
  dialog.showOpenDialog(win, {properties: ["openFile"]}, function(filePaths){
    if(filePaths) win.webContents.send('openFile', {filePaths: filePaths});
  });
}

app.on("ready", function(){
  //create windows (visible UI and invisible worker):
  createWindows();

  //relay messages from UI to worker, from worker to UI:
  ipcMain.on("message-to-worker", (event, arg) => {
    console.log("message-to-worker", arg);
    workerWindow.webContents.send("message-to-worker", arg);
  });
  ipcMain.on("message-to-ui", (event, arg) => {
    console.log("message-to-ui", arg);
    uiWindow.webContents.send("message-to-ui", arg);
  });
});
