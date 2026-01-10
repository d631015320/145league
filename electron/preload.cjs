// electron/preload.cjs
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // 检查是否在 Electron 环境中 (用于区分网页版和桌面版)
    isElectron: true
});
