const { app, BrowserWindow } = require("electron");
const { default: installExtension } = require("electron-devtools-installer");

let window;

function createWindow() {
    window = new BrowserWindow({
        width: 1500,
        height: 800,
        center: true,
        title: "Simple Twitch Desktop",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webviewTag: true,
            autoplayPolicy: "user-gesture-required"
        }
    });

    window.setMenuBarVisibility = false;
    window.maximize();
}

function installExtensions() {
    return installExtension(["fadndhdgpmmaapbmfcknlfgcflmmmieb"]).then((name) => {
        console.log(`Added ${name} !`);
    }).catch((error) => {
        console.log(error);
    });
}

app.allowRendererProcessReuse = true;

app.whenReady().then(() => {
    createWindow();
    installExtensions().then(() => {
        window.loadFile("src/app.html");
    });
});

app.once("window-all-closed", app.quit);
