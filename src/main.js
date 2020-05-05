/* Copyright 2020 the original authors.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. */

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
            contextIsolation: false,
            sandbox: true,
            webviewTag: true,
            autoplayPolicy: "user-gesture-required"
        }
    });

    window.maximize();

    window.webContents.on("will-attach-webview", (e, webPreferences, params) => {
        delete webPreferences.preload;

        webPreferences.nodeIntegration = false;
        webPreferences.spellcheck = true;
        webPreferences.sandbox = true;

        // Verify URL
        if (!params.src.startsWith('https://www.twitch.tv')) {
            e.preventDefault();
        }
    });

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
