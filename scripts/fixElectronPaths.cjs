const fs = require('fs');
const path = require('path');

// Ruta al archivo index.html generado
const indexPath = path.resolve(__dirname, '../dist/index.html');

// Leer el archivo HTML
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Reemplazar rutas absolutas por relativas
htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="./assets/');
htmlContent = htmlContent.replace(/href="\/assets\//g, 'href="./assets/');
htmlContent = htmlContent.replace(/href="\/vite\.svg"/g, 'href="./vite.svg"');

// Escribir el archivo corregido
fs.writeFileSync(indexPath, htmlContent);

console.log('✅ Rutas corregidas en dist/index.html para Electron'); 