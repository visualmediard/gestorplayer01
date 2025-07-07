import { app, BrowserWindow } from 'electron';
import * as path from 'path';
function createWindow() {
    var win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        fullscreen: true,
        autoHideMenuBar: true,
    });
    // Cargar el build de producción de React
    win.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
