// Import statements at the very top
const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const MyExtension = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionManager = MyExtension.imports.extensionManager;
const Environment = MyExtension.imports.environment;

// Code implementation
let applet;

function init() {
    Environment.init();
    applet = ExtensionManager.main(MyExtension.metadata, St.Side.TOP, Main.panel.height, 1);
}

function enable() {
    Mainloop.idle_add(() => {
        applet.on_applet_added_to_panel(false);
        applet.setOrientation(St.Side.TOP);
        return false;
    });
}

function disable() {
    applet.on_applet_removed_from_panel();
}
