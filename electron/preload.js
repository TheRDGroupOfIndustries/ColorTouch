const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: send notification to main process
  sendNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  
  // Example: get app version
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version');
  },

  // Platform info
  platform: process.platform,
  
  // Add more API methods as needed for your app
});

// Log that preload script loaded successfully
console.log('Preload script loaded successfully');
