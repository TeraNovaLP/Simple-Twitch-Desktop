const { app, dialog, Menu, BrowserWindow } = require("electron");
const { default: installExtension } = require("electron-devtools-installer");
const shell = require("electron").shell;

let window;
let twitchFrameWebContents;

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

    window.maximize();

    window.webContents.on("did-attach-webview", (e, webContents) => {
        twitchFrameWebContents = webContents;

        // Open external links in default browser.
        webContents.on("new-window", (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
        });

        // Open external URLs that don't target blank in the default browser.
        webContents.on("will-navigate", (ev, url) => {
            if (!url.includes("https://www.twitch.tv")) {
                ev.preventDefault();
                shell.openExternal(url);
            }
        });
    });

    overrideMenu();
}

function overrideMenu() {
    const template = [
        {
            label: "View",
            submenu: [
                {
                    label: "Go forward",
                    click() { twitchFrameWebContents.goForward() }
                },
                {
                    label: "Go back",
                    click() { twitchFrameWebContents.goBack() }
                },
                {
                    label: "Refresh",
                    click() { twitchFrameWebContents.reload() }
                }
            ]
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "Toggle Twitch Frame Developer Tools",
                    click() { twitchFrameWebContents.toggleDevTools() }
                },
                {
                    label: "Toggle Main Window Developer Tools",
                    click() { window.toggleDevTools() }
                },
                {
                    label: "About",
                    click() { dialog.showMessageBox(window, { title: "About Simple Twitch Desktop", message: "Simple Twitch Desktop", detail: `Version: ${app.getVersion()}` }) }
                }
            ]
        }
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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
