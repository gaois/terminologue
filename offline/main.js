const {app, dialog, BrowserWindow, Menu, MenuItem}=require("electron");
var win=null;

function createWindow(){
  win=new BrowserWindow({
    title: app.getName(),
    icon: __dirname+"/appicon/appicon.png",
    backgroundColor: "#dee7e6",
    show: false,
    width: 1400,
    height: 800,
    center: true,
    webPreferences: {
      nodeIntegration: true
    },
  });
  Menu.setApplicationMenu(buildMenu());
  win.loadFile(__dirname+"/index.html");
  win.once("ready-to-show", () => {
    win.show();
  });
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

app.on("ready", createWindow);
