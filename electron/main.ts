import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: 'GestorPlayer app',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      // Configurar CSP para permitir Supabase
      additionalArguments: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    },
    fullscreen: true,
    autoHideMenuBar: true,
  });

  // Configurar CSP para permitir Supabase
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://zspeoizdglawqvduxhbg.supabase.co; connect-src 'self' https://zspeoizdglawqvduxhbg.supabase.co wss://zspeoizdglawqvduxhbg.supabase.co; img-src 'self' data: blob: https://zspeoizdglawqvduxhbg.supabase.co; media-src 'self' data: blob: https://zspeoizdglawqvduxhbg.supabase.co; style-src 'self' 'unsafe-inline'; font-src 'self' data:;"
      }
    });
  });

  // Usar path absoluto para cargar el build de producción de React
  win.loadFile(path.resolve(__dirname, '../dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 