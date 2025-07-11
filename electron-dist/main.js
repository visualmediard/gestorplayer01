"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1920,
        height: 1080,
        title: 'GestorPlayer app',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // Deshabilitar webSecurity para permitir cargar archivos locales
            allowRunningInsecureContent: true,
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
                'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://zspeoizdglawqvduxhbg.supabase.co; connect-src 'self' https://zspeoizdglawqvduxhbg.supabase.co wss://zspeoizdglawqvduxhbg.supabase.co; img-src 'self' data: blob: file: https://zspeoizdglawqvduxhbg.supabase.co; media-src 'self' data: blob: file: https://zspeoizdglawqvduxhbg.supabase.co; style-src 'self' 'unsafe-inline' file:; font-src 'self' data: file:;"
            }
        });
    });
    // Cargar directamente el archivo HTML
    win.loadFile(path.resolve(__dirname, '../dist/index.html'));
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
