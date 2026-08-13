const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Serving the packaged Angular app over a bare file:// URL gives it an opaque
// "null" Origin on cross-origin fetches, which the API's CORS policy can't
// allowlist reliably. Registering a custom privileged scheme instead gives
// the app a stable, real origin (app://index) to allowlist server-side.
const APP_SCHEME = 'app';
const APP_HOST = 'index';
const BROWSER_DIST = path.join(__dirname, 'dist/analytics-ai-client/browser');

protocol.registerSchemesAsPrivileged([
    {
        scheme: APP_SCHEME,
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
]);

let appWindow;

function createWindow() {
    appWindow = new BrowserWindow({
        width: 1000,
        height: 800,
    });
    appWindow.loadURL(`${APP_SCHEME}://${APP_HOST}/index.html`);

    appWindow.on('closed', () => {
        appWindow = null;
    });
}

app.whenReady().then(() => {
    protocol.handle(APP_SCHEME, (request) => {
        const requestUrl = new URL(request.url);
        const relativePath = decodeURIComponent(requestUrl.pathname);
        const filePath = path.join(BROWSER_DIST, relativePath);
        return net.fetch(pathToFileURL(filePath).toString());
    });

    createWindow();
});
