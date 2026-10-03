const { app, BrowserWindow, net, protocol, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const scheme = 'palmquest';
const origin = `${scheme}://app`;
const dist = path.join(app.getAppPath(), 'dist');

protocol.registerSchemesAsPrivileged([{
  scheme,
  privileges: { standard: true, secure: true, supportFetchAPI: true },
}]);

app.whenReady().then(() => {
  protocol.handle(scheme, request => {
    const url = new URL(request.url);
    if (url.host !== 'app') return new Response('Not found', { status: 404 });
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`);
    
    // Fallback if legacy png/jpg or /images/ path is requested
    if (!fs.existsSync(file)) {
      const fallbackPathname = pathname
        .replace(/^\/images\//, '/assets/')
        .replace(/\.(png|jpe?g)$/i, (m) => m.toLowerCase().includes('cursor') ? m : '.webp');
      const fallbackFile = path.resolve(dist, `.${fallbackPathname}`);
      if (fs.existsSync(fallbackFile)) {
        file = fallbackFile;
      }
    }

    const relative = path.relative(dist, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(file).toString());
  });

  const window = new BrowserWindow({
    title: 'PALMQuest',
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#eadbc7',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(origin)) event.preventDefault();
  });
  window.loadURL(`${origin}/index.html`);
});

app.on('window-all-closed', () => app.quit());
