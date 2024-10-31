const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
// const http = require('http');
// const path = require('path');
const isDev = process.env.ELECTRON_ENV === 'development';
const URLReact = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
let port;
try {
    const url = new URL(URLReact);
    port = url.port || (url.protocol === 'http:' ? '80' : '443'); // Asignar el puerto predeterminado si no está especificado
    console.log(`El puerto es: ${port}`);
} catch (error) {
    console.error('Error al analizar la URL:', error);
}

let mainWindow;

// Función para cerrar el proceso que utiliza el puerto
function closePortProcess(port) {
    exec(`lsof -t -i:${port}`, (err, stdout) => {
        if (err) {
            console.error(`Error al obtener el proceso en el puerto ${port}:`, err);
            return;
        }

        const processIds = stdout.split('\n').filter(Boolean); // Filtrar líneas vacías
        processIds.forEach(pid => {
            exec(`kill -9 ${pid}`, (killErr) => {
                if (killErr) {
                    console.error(`Error al cerrar el proceso ${pid}:`, killErr);
                } else {
                    console.log(`Proceso ${pid} cerrado.`);
                }
            });
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    console.log(`isDev: ${isDev}`);
    console.log(`URLReact: ${URLReact}`);
    mainWindow.loadURL(URLReact);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => {
        closePortProcess(port); // Cerrar el proceso en el puerto 3000
        mainWindow = null;
    });
}

app.on('ready', () => {
    // startReact();  // Iniciar el servidor React
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});