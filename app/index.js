const electron = require('electron');
app = electron.app;
Win = electron.BrowserWindow;

app.on('ready', function() {
  let win = new Win();
  win.loadURL('https://lordandsavior-dev.herokuapp.com/');
});