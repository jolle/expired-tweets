const electron = require('electron');
const path = require('path');
const url = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const window = {
    win: null,

    create() {
        window.win = new BrowserWindow({
            width: 450,
            height: 750,
        });

        window.win.loadURL(url.format({
            pathname: path.join(__dirname, 'gui/index.html'),
            protocol: 'file:',
            slashes: true,
        }));

        window.win.on('closed', () => {
            window.win = null;
        });
    },
};

app.on('ready', window.create);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (window.win === null) window.create();
});
