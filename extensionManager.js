const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Gettext = imports.gettext;

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const Util = imports.misc.util;
const ExtensionSystem = imports.ui.extensionSystem;

const MyExtension = imports.misc.extensionUtils.getCurrentExtension();
const Applet = MyExtension.imports.applet;
const ConfigurableMenus = MyExtension.imports.configurableMenus;
const IndicatorAppMenuWatcher = MyExtension.imports.indicatorAppMenuWatcher;
const Settings = MyExtension.imports.settings.settings;
const HudProvider = MyExtension.imports.hudProvider;
const RemoteMenu = MyExtension.imports.remoteMenu;
const HudSearch = MyExtension.imports.hudSearch;

function _(str) {
    let resultConf = Gettext.dgettext(MyExtension.uuid, str);
    if (resultConf !== str) {
        return resultConf;
    }
    return Gettext.gettext(str);
}

class MyMenuFactory extends ConfigurableMenus.MenuFactory {
    constructor() {
        super();
        this._showBoxPointer = true;
        this._openSubMenu = false;
        this._closeSubMenu = false;
        this._floatingMenu = false;
        this._floatingSubMenu = true;
        this._alignSubMenu = false;
        this._showItemIcon = true;
        this._desaturateItemIcon = false;
        this._openOnHover = false;
        this._arrowSide = St.Side.BOTTOM;
        this._effectType = "none";
        this._effectTime = 0.4;
    }

    setMainMenuArrowSide(arrowSide) {
        if (this._arrowSide !== arrowSide) {
            this._arrowSide = arrowSide;
            for (let pos in this._menuLinkend) {
                let shellMenu = this._menuLinkend[pos];
                if (shellMenu)
                    shellMenu.setArrowSide(this._arrowSide);
            }
        }
    }

    setOpenOnHover(openOnHover) {
        if (this._openOnHover !== openOnHover) {
            this._openOnHover = openOnHover;
            for (let pos in this._menuLinkend) {
                let shellMenu = this._menuLinkend[pos];
                if (shellMenu)
                    shellMenu.setOpenOnHover(this._openOnHover);
            }
        }
    }

    setEffect(effect) {
        if (this._effectType !== effect) {
            this._effectType = effect;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setEffect(this._effectType);
            }
        }
    }

    setEffectTime(effectTime) {
        if (this._effectTime !== effectTime) {
            this._effectTime = effectTime;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setEffectTime(this._effectTime);
            }
        }
    }

    setFloatingState(floating) {
        if (this._floatingMenu !== floating) {
            this._floatingMenu = floating;
            for (let pos in this._menuLinkend) {
                let shellMenu = this._menuLinkend[pos];
                if (shellMenu) {
                    shellMenu.setFloatingState(this._floatingMenu);
                }
            }
        }
    }

    showBoxPointer(show) {
        if (this._showBoxPointer !== show) {
            this._showBoxPointer = show;
            for (let pos in this._menuManager) {
                this._menuManager[pos].showBoxPointer(this._showBoxPointer);
            }
        }
    }

    setAlignSubMenu(align) {
        if (this._alignSubMenu !== align) {
            this._alignSubMenu = align;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setAlignSubMenu(this._alignSubMenu);
            }
        }
    }

    setOpenSubMenu(openSubMenu) {
        if (this._openSubMenu !== openSubMenu) {
            this._openSubMenu = openSubMenu;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setOpenSubMenu(this._openSubMenu);
            }
        }
    }

    setCloseSubMenu(closeSubMenu) {
        if (this._closeSubMenu !== closeSubMenu) {
            this._closeSubMenu = closeSubMenu;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setCloseSubMenu(this._closeSubMenu);
            }
        }
    }

    setFloatingSubMenu(floating) {
        if (this._floatingSubMenu !== floating) {
            this._floatingSubMenu = floating;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setFloatingSubMenu(this._floatingSubMenu);
            }
        }
    }

    setIconVisible(show) {
        if (this._showItemIcon !== show) {
            this._showItemIcon = show;
            for (let pos in this._menuManager) {
                this._menuManager[pos].setIconVisible(this._showItemIcon);
            }
        }
    }

    desaturateItemIcon(desaturate) {
        if (this._desaturateItemIcon !== desaturate) {
            this._desaturateItemIcon = desaturate;
            for (let pos in this._menuManager) {
                this._menuManager[pos].desaturateItemIcon(this._desaturateItemIcon);
            }
        }
    }

    _createShellItem(factoryItem, launcher, orientation, menuManager) {
        this._arrowSide = orientation;
        if (menuManager) {
            menuManager.showBoxPointer(this._showBoxPointer);
            menuManager.setOpenSubMenu(this._openSubMenu);
            menuManager.setCloseSubMenu(this._closeSubMenu);
            menuManager.setAlignSubMenu(this._alignSubMenu);
            menuManager.setIconVisible(this._showItemIcon);
            menuManager.desaturateItemIcon(this._desaturateItemIcon);
            menuManager.setEffect(this._effectType);
            menuManager.setEffectTime(this._effectTime);
        }
        let shellItem = null;
        let itemType = factoryItem.getFactoryType();
        if (itemType === ConfigurableMenus.FactoryClassTypes.RootMenuClass)
            shellItem = new ConfigurableMenus.ConfigurableMenuApplet(launcher, orientation, menuManager);
        if (itemType === ConfigurableMenus.FactoryClassTypes.SubMenuMenuItemClass)
            shellItem = new ConfigurableMenus.ConfigurablePopupSubMenuMenuItem("FIXME", true);
        else if (itemType === ConfigurableMenus.FactoryClassTypes.MenuSectionMenuItemClass)
            shellItem = new ConfigurableMenus.ConfigurablePopupMenuSection();
        else if (itemType === ConfigurableMenus.FactoryClassTypes.SeparatorMenuItemClass)
            shellItem = new ConfigurableMenus.ConfigurableSeparatorMenuItem();
        else if (itemType === ConfigurableMenus.FactoryClassTypes.MenuItemClass)
            shellItem = new ConfigurableMenus.ConfigurableApplicationMenuItem("FIXME");

        if (itemType === ConfigurableMenus.FactoryClassTypes.RootMenuClass) {
            shellItem.setFloatingState(this._floatingMenu);
            shellItem.setOpenOnHover(this._openOnHover);
        } else if (itemType === ConfigurableMenus.FactoryClassTypes.SubMenuMenuItemClass) {
            shellItem.menu.setFloatingState(this._floatingSubMenu);
        }
        return shellItem;
    }
}

class MyApplet extends Applet.Applet {
    _init(metadata, orientation, panelHeight, instanceId) {
        super._init(orientation, panelHeight, instanceId);
        try {
            this.uuid = metadata["uuid"];
            this.orientation = orientation;
            this.execInstallLanguage();

            this.set_applet_tooltip(_("Gnome Global Application Menu"));

            this.currentWindow = null;
            this.sendWindow = null;
            this.showAppIcon = true;
            this.showAppName = true;
            this.desaturateAppIcon = false;
            this.maxAppNameSize = 10;
            this.automaticActiveMainMenu = true;
            this.openActiveSubmenu = false;
            this.closeActiveSubmenu = false;
            this.showBoxPointer = true;
            this.alignMenuLauncher = false;
            this.showItemIcon = true;
            this.desaturateItemIcon = false;
            this.openOnHover = false;
            this._keybindingTimeOut = 0;
            this.effectType = "none";
            this.effectTime = 0.4;
            this.replaceAppMenu = false;

            this.appmenu = null;
            this.targetApp = null;
            this._appMenuNotifyId = 0;
            this._actionGroupNotifyId = 0;
            this._busyNotifyId = 0;

            this.gradient = new ConfigurableMenus.GradientLabelMenuItem("", 10);
            this.actor.add(this.gradient.actor);
            this.actor.connect("enter-event", this._onAppletEnterEvent.bind(this));

            this.menuFactory = new MyMenuFactory();
            this._system = new IndicatorAppMenuWatcher.SystemProperties();

            this._menuManager.removeMenu(this._applet_context_menu);
            this._applet_context_menu.destroy();
            this._applet_context_menu = new ConfigurableMenus.ConfigurableMenu(this, 0.0, orientation, true);
            this._menuManager = new ConfigurableMenus.ConfigurableMenuManager(this);
            this._menuManager.addMenu(this._applet_context_menu);
            this.defaultIcon = new St.Icon({ icon_name: "view-app-grid-symbolic", icon_type: St.IconType.FULLCOLOR, style_class: 'popup-menu-icon' });
            this.hubProvider = new HudProvider.HudSearchProvider();
            this.hudMenuSearch = new HudSearch.GlobalMenuSearch(this.gradient);
            this._menuManager.addMenu(this.hudMenuSearch);

            this._createSettings();
            this._cleanAppmenu();
            this.indicatorDbus = null;
            this._indicatorId = 0;
            this._showsAppMenuId = 0;
            this._overviewHidingId = 0;
            this._overviewShowingId = 0;
            this._appStateChangedSignalId = 0;
            this._switchWorkspaceNotifyId = 0;

            this._gtkSettings = Gtk.Settings.get_default();
            this.appSys = Shell.AppSystem.get_default();

            Main.sessionMode.connect('updated', this._sessionUpdated.bind(this));
            this._sessionUpdated();
        } catch (e) {
            Main.notify(`Init error: ${e.message}`);
            global.logError(`Init error: ${e.message}`);
        }
    }

    _sessionUpdated() {
        let sensitive = !Main.sessionMode.isLocked && !Main.sessionMode.isGreeter;
        if (!this.indicatorDbus || (sensitive && !this.indicatorDbus.isWatching())) {
            this.indicatorDbus = new IndicatorAppMenuWatcher.IndicatorAppMenuWatcher(
                IndicatorAppMenuWatcher.AppmenuMode.MODE_STANDARD, this._getIconSize()
            );
            this._isReady = this._initEnvironment();
            if (this._isReady) {
                this.indicatorDbus.watch();
                this.hubProvider.setIndicator(this.indicatorDbus, this.currentWindow);
                this.hudMenuSearch.setIndicator(this.indicatorDbus, this.currentWindow);
                if (this._indicatorId === 0) {
                    this._indicatorId = this.indicatorDbus.connect('appmenu-changed', this._onAppmenuChanged.bind(this));
                    this._onAppmenuChanged(this.indicatorDbus, this.currentWindow);
                }
                if (this._showsAppMenuId === 0) {
                    this._showsAppMenuId = this._gtkSettings.connect('notify::gtk-shell-shows-app-menu',
                        this._onShowAppMenuChanged.bind(this));
                }
                if (this._overviewHidingId === 0) {
                    this._overviewHidingId = Main.overview.connect('hiding', this._onAppMenuNotify.bind(this));
                }
                if (this._overviewShowingId === 0) {
                    this._overviewShowingId = Main.overview.connect('showing', this._onAppMenuNotify.bind(this));
                }
                if (this._appStateChangedSignalId === 0) {
                    this._appStateChangedSignalId = this.appSys.connect('app-state-changed', this._onAppMenuNotify.bind(this));
                }
                if (this._switchWorkspaceNotifyId === 0) {
                    this._switchWorkspaceNotifyId = global.window_manager.connect('switch-workspace',
                        this._onAppMenuNotify.bind(this));
                }
            } else {
                Main.notify(_("You need to restart your computer to activate the unity-gtk-module"));
            }
        }
    }

    _onButtonPressEvent(actor, event) {
        if (this._applet_enabled) {
            if (event.get_button() === 1) {
                if (!this._draggable.inhibit) {
                    if (this._applet_context_menu.isOpen) {
                        this._applet_context_menu.toggle();
                    }
                    return this.on_applet_clicked(event);
                }
            }
            if (event.get_button() === 3) {
                if (this._applet_context_menu.getMenuItems().length > 0) {
                    this._applet_context_menu.toggle();
                }
            }
        }
        return true;
    }

    _createSettings() {
        this.settings = new Settings.AppletSettings(this, this.uuid, this.instance_id);
        this.settings.bindProperty(Settings.BindingDirection.IN, "enable-search-provider", "enableProvider", this._onEnableProviderChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "enable-environment", "enableEnvironment", this._onEnableEnvironmentChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "replace-appmenu", "replaceAppMenu", this._onReplaceAppMenuChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "enable-jayantana", "enableJayantana", this._onEnableJayantanaChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "show-app-icon", "showAppIcon", this._onShowAppIconChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "desaturate-app-icon", "desaturateAppIcon", this._onDesaturateAppIconChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "show-app-name", "showAppName", this._onShowAppNameChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "text-gradient", "textGradient", this._onTextGradientChange.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "max-app-name-size", "maxAppNameSize", this._onMaxAppNameSizeChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "automatic-active-mainmenu", "automaticActiveMainMenu", this._automaticActiveMainMenuChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "open-active-submenu", "openActiveSubmenu", this._onOpenActiveSubmenuChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "close-active-submenu", "closeActiveSubmenu", this._onCloseActiveSubmenuChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "show-boxpointer", "showBoxPointer", this._onShowBoxPointerChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "align-menu-launcher", "alignMenuLauncher", this._onAlignMenuLauncherChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "global-overlay-key", "overlayKey", this._updateKeybinding.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "hud-overlay-key", "hudOverlayKey", this._updateHudKeybinding.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "num-items", "numbreOfItems", this._updateNumbreOfItems.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "display-in-panel", "displayInPanel", this._onDisplayInPanelChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "show-item-icon", "showItemIcon", this._onShowItemIconChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "desaturate-item-icon", "desaturateItemIcon", this._onDesaturateItemIconChanged.bind(this), null);

        this.settings.bindProperty(Settings.BindingDirection.IN, "activate-on-hover", "openOnHover", this._onOpenOnHoverChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "effect", "effectType", this._onEffectTypeChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "effect-time", "effectTime", this._onEffectTimeChanged.bind(this), null);

        this._onEnableProviderChanged();
        this._onEnableEnvironmentChanged();
        this._onEnableJayantanaChanged();
        this._onDisplayInPanelChanged();
        this._onShowAppIconChanged();
        this._onDesaturateAppIconChanged();
        this._onShowAppNameChanged();
        this._onTextGradientChange();
        this._onMaxAppNameSizeChanged();
        this._updateKeybinding();
        this._updateHudKeybinding();
        this._updateNumbreOfItems();

        this._onOpenActiveSubmenuChanged();
        this._onCloseActiveSubmenuChanged();
        this._onShowBoxPointerChanged();
        this._onAlignMenuLauncherChanged();
        this._onShowItemIconChanged();
        this._onDesaturateItemIconChanged();
        this._onOpenOnHoverChanged();
        this._onEffectTypeChanged();
        this._onEffectTimeChanged();
        this._onReplaceAppMenuChanged();
    }

    _initEnvironment() {
        let isReady = this._system.activeUnityGtkModule(true);
        if (isReady) {
            this._system.activeJAyantanaModule(this.enableJayantana);
            this._system.shellShowMenubar(true);
            this._system.activeQtPlatform(true);
            this._system.activeUnityMenuProxy(true);
            return true;
        }
        return false;
    }

    openAbout() {
        if (Applet.Applet.prototype.openAbout)
            Applet.Applet.prototype.openAbout.call(this);
        else
            Main.notify("Missing reference to the About Dialog");
    }

    configureApplet() {
        if (Applet.Applet.prototype.configureApplet)
            Applet.Applet.prototype.configureApplet.call(this);
        else
            Util.spawnCommandLine(`xlet-settings applet ${this._uuid} ${this.instance_id}`);
    }

    finalizeContextMenu() {
        let items = this._applet_context_menu.getMenuItems();

        if (!this.context_menu_item_remove) {
            this.context_menu_item_remove = new ConfigurableMenus.ConfigurableBasicPopupMenuItem(_("Remove '%s'").format(_(this._meta.name)));
            this.context_menu_item_remove.setIconName("edit-delete");
            this.context_menu_item_remove.setIconVisible(true);
            this.context_menu_item_remove.setIconType(St.IconType.SYMBOLIC);
            this.context_menu_item_remove.connect('activate', () => {
                let enabled = global.settings.get_strv('enabled-extensions');
                let index = enabled.indexOf(MyExtension.uuid);
                if (index > -1) {
                    enabled.splice(index, 1);
                }
                global.settings.set_strv('enabled-extensions', enabled);
            });
        }
        if (!this.context_menu_item_about) {
            this.context_menu_item_about = new ConfigurableMenus.ConfigurableBasicPopupMenuItem(_("About..."));
            this.context_menu_item_about.setIconName("dialog-question");
            this.context_menu_item_about.setIconVisible(true);
            this.context_menu_item_about.setIconType(St.IconType.SYMBOLIC);
            this.context_menu_item_about.connect('activate', this.openAbout.bind(this));
        }

        if (!this.context_menu_separator) {
            this.context_menu_separator = new ConfigurableMenus.ConfigurableSeparatorMenuItem();
        }

        if (items.indexOf(this.context_menu_item_about) === -1) {
            this._applet_context_menu.addMenuItem(this.context_menu_item_about);
        }
        if (!this._meta["hide-configuration"] && GLib.file_test(`${MyExtension.path}/settings-schema.json`, GLib.FileTest.EXISTS)) {
            if (!this.context_menu_item_configure) {
                this.context_menu_item_configure = new ConfigurableMenus.ConfigurableBasicPopupMenuItem(_("Configure..."));
                this.context_menu_item_configure.setIconName("system-run");
                this.context_menu_item_configure.setIconVisible(true);
                this.context_menu_item_configure.setIconType(St.IconType.SYMBOLIC);
                this.context_menu_item_configure.connect('activate', this.configureApplet.bind(this));
            }
            if (items.indexOf(this.context_menu_item_configure) === -1) {
                this._applet_context_menu.addMenuItem(this.context_menu_item_configure);
            }
        }

        if (items.indexOf(this.context_menu_item_remove) === -1) {
            this._applet_context_menu.addMenuItem(this.context_menu_item_remove);
        }
    }

    _finalizeEnvironment() {
        this._system.shellShowMenubar(false);
        this._system.activeQtPlatform(false);
        this._system.activeUnityMenuProxy(false);
        this._system.activeJAyantanaModule(false);
    }

    _onReplaceAppMenuChanged() {
        let parent = this.actor.get_parent();
        if (parent)
            parent.remove_actor(this.actor);
        let children = Main.panel._leftBox.get_children();
        if (this.replaceAppMenu) {
            if (Main.panel.statusArea.appMenu) {
                let index = children.indexOf(Main.panel.statusArea.appMenu.container);
                if (index !== -1) {
                    Main.panel.statusArea.appMenu.destroy();
                    Main.panel.statusArea['appMenu'] = new St.Bin();
                    Main.panel.statusArea['appMenu'].actor = Main.panel.statusArea['appMenu'];
                    Main.panel.statusArea['appMenu'].container = Main.panel.statusArea['appMenu'];
                    Main.panel.statusArea['appMenu'].connect = function () { };
                    Main.panel._leftBox.insert_child_at_index(this.actor, index);
                } else {
                    Main.panel._leftBox.insert_child_at_index(this.actor, index);
                }
            } else {
                Main.panel._leftBox.insert_child_at_index(this.actor, children.length);
            }
        } else {
            if (Main.panel.statusArea.appMenu) {
                Main.panel.statusArea.appMenu.destroy();
                Main.panel.statusArea.appMenu = null;
            }
            let panel = Main.sessionMode.panel;
            Main.panel._updateBox(panel.left, Main.panel._leftBox);
            let children = Main.panel._leftBox.get_children();
            if (Main.panel.statusArea.appMenu) {
                let index = children.indexOf(Main.panel.statusArea.appMenu.container);
                if (index !== -1) {
                    Main.panel._leftBox.insert_child_at_index(this.actor, index);
                } else {
                    Main.panel._leftBox.insert_child_at_index(this.actor, children.length);
                }
            } else {
                Main.panel._leftBox.insert_child_at_index(this.actor, children.length);
            }
        }
    }

    _onEnableProviderChanged() {
        if (this.enableProvider) {
            this.hubProvider.enable();
        } else {
            this.hubProvider.disable();
        }
    }

    _onEnableEnvironmentChanged() {
        if (this.enableEnvironment !== this._system.isEnvironmentSet()) {
            this._system.setEnvironmentVar(this.enableEnvironment, this._envVarChanged.bind(this));
        }
    }

    _envVarChanged(result, error) {
        this.enableEnvironment = result;
        if (error)
            Main.notify(_("The environment variable cannot be changed"));
        else
            Main.notify(_("The environment variable was set, a logout will be required to apply the changes"));
    }

    _onEnableJayantanaChanged() {
        this._system.activeJAyantanaModule(this.enableJayantana);
    }

    _updateKeybinding() {
        this.keybindingManager.addHotKey("global-overlay-key", this.overlayKey, () => {
            if (this.menu && !Main.overview.visible) {
                this.menu.toggleSubmenu(true);
            }
        });
    }

    _updateHudKeybinding() {
        this.keybindingManager.addHotKey("global-hud-key", this.hudOverlayKey, () => {
            if (!Main.overview.visible) {
                this.hudMenuSearch.toggle(true);
            }
        });
    }

    _updateNumbreOfItems() {
        this.hudMenuSearch.setMaxNumberOfItems(this.numbreOfItems);
    }

    _onEffectTypeChanged() {
        this.menuFactory.setEffect(this.effectType);
    }

    _onEffectTimeChanged() {
        this.menuFactory.setEffectTime(this.effectTime);
    }

    _onOpenOnHoverChanged() {
        this.menuFactory.setOpenOnHover(this.openOnHover);
    }

    _onDisplayInPanelChanged() {
        this.menuFactory.setFloatingState(!this.displayInPanel);
    }

    _onShowAppIconChanged() {
        this.gradient.showIcon(this.showAppIcon);
    }

    _onDesaturateAppIconChanged() {
        this.gradient.desaturateIcon(this.desaturateAppIcon);
    }

    _onShowAppNameChanged() {
        this.gradient.actor.visible = this.showAppName;
    }

    _onTextGradientChange() {
        this.gradient.setTextDegradation(this.textGradient);
    }

    _onMaxAppNameSizeChanged() {
        this.gradient.setSize(this.maxAppNameSize);
    }

    _automaticActiveMainMenuChanged() {
        if (this.automaticActiveMainMenu)
            this._closeMenu();
    }

    _onOpenActiveSubmenuChanged() {
        this.menuFactory.setOpenSubMenu(this.openActiveSubmenu);
    }

    _onCloseActiveSubmenuChanged() {
        this.menuFactory.setCloseSubMenu(this.closeActiveSubmenu);
    }

    _onShowBoxPointerChanged() {
        this.menuFactory.showBoxPointer(this.showBoxPointer);
        if (this._applet_context_menu.showBoxPointer)
            this._applet_context_menu.showBoxPointer(this.showBoxPointer);
    }

    _onAlignMenuLauncherChanged() {
        this.menuFactory.setAlignSubMenu(this.alignMenuLauncher);
    }

    _onShowItemIconChanged() {
        this.menuFactory.setIconVisible(this.showItemIcon);
    }

    _onDesaturateItemIconChanged() {
        this.menuFactory.desaturateItemIcon(this.desaturateItemIcon);
    }

    setAppMenu(menu) {
        if (this.appmenu)
            this.appmenu.destroy();
        this.appmenu = null;
        if (this.menu && menu && this._gtkSettings.gtk_shell_shows_app_menu) {
            this.menu.setStartCounter(0);
            let tempName = "FIXME";
            if (this.targetApp !== null)
                tempName = this.targetApp.get_name();
            this.appmenu = new ConfigurableMenus.ConfigurablePopupSubMenuMenuItem(tempName, false);
            this.appmenu.setFloatingSubMenu(true);
            this.appmenu.setMenu(menu);
            this.appmenu.actor.add_style_class_name('panel-menu');
            menu.actor.hide();

            this.menu.addMenuItem(this.appmenu, null, 0);
            this.menu.setStartCounter(1);
        }
        this.emit('menu-set');
    }

    _onShowAppMenuChanged() {
        if (!this._gtkSettings.gtk_shell_shows_app_menu) {
            this.setAppMenu(null);
        } else {
            this._onAppMenuNotify();
        }
    }

    _onAppMenuNotify() {
        let visible = (this.targetApp !== null &&
            !Main.overview.visibleTarget &&
            this.targetApp.is_on_workspace(global.screen.get_active_workspace()));
        if (visible) {
            this.actor.show();
        } else {
            this.actor.hide();
        }
        let isBusy = (this.targetApp !== null &&
            (this.targetApp.get_state() === Shell.AppState.STARTING ||
                this.targetApp.get_busy()));

        this.actor.reactive = (visible && !isBusy);

        let menu = null;
        if (this.targetApp && this.targetApp.action_group && this.targetApp.menu) {
            if (this.appmenu instanceof RemoteMenu.RemoteMenu &&
                this.appmenu.actionGroup === this.targetApp.action_group)
                return;

            menu = new RemoteMenu.RemoteMenu(this.actor, this.targetApp.menu, this.targetApp.action_group);
            menu.connect('activate', () => {
                let win = this.targetApp.get_windows()[0];
                win.check_alive(global.get_current_time());
            });
        }

        this.setAppMenu(menu);
    }

    _onAppmenuChanged(indicator, window) {
        let newLabel = null;
        let newIcon = null;
        let newMenu = null;
        let app = null;
        this.currentWindow = window;
        if (this.currentWindow) {
            app = this.indicatorDbus.getAppForWindow(this.currentWindow);
            if (app) {
                newIcon = this.indicatorDbus.getIconForWindow(this.currentWindow);
                newLabel = app.get_name();
                let dbusMenu = this.indicatorDbus.getRootMenuForWindow(this.currentWindow);
                if (dbusMenu) {
                    newMenu = this.menuFactory.getShellMenu(dbusMenu);
                    if (!newMenu) {
                        let menuManager = new ConfigurableMenus.ConfigurableMenuManager(this);
                        newMenu = this.menuFactory.buildShellMenu(dbusMenu, this, this.orientation, menuManager);
                    }
                }
            }
        }
        this._tryToShow(newLabel, newIcon, newMenu);
        this._tryToTrackAppMenu(app);
    }

    _tryToTrackAppMenu(app) {
        if (this.targetApp !== app) {
            if (this._appMenuNotifyId !== 0) {
                this.targetApp.disconnect(this._appMenuNotifyId);
                this._appMenuNotifyId = 0;
            }
            if (this._actionGroupNotifyId !== 0) {
                this.targetApp.disconnect(this._actionGroupNotifyId);
                this._actionGroupNotifyId = 0;
            }
            if (this._busyNotifyId !== 0) {
                this.targetApp.disconnect(this._busyNotifyId);
                this._busyNotifyId = 0;
            }
            this.targetApp = app;
            if (this.targetApp) {
                this._appMenuNotifyId = this.targetApp.connect('notify::menu', this._onAppMenuNotify.bind(this));
                this._actionGroupNotifyId = this.targetApp.connect('notify::action-group', this._onAppMenuNotify.bind(this));
                this._busyNotifyId = this.targetApp.connect('notify::busy', this._onAppMenuNotify.bind(this));
            }
        }
        this._onAppMenuNotify();
    }

    _tryToShow(newLabel, newIcon, newMenu) {
        if ((newLabel !== null) && (newIcon !== null)) {
            this._changeAppmenu(newLabel, newIcon, newMenu);
        } else {
            this._cleanAppmenu();
        }
    }

    _changeAppmenu(newLabel, newIcon, newMenu) {
        if (newMenu !== this.menu) {
            this._closeMenu();
            this.menu = newMenu;
            if (this.menu && this.automaticActiveMainMenu && !this.menu.isInFloatingState())
                this.menu.open();
        }
        this.gradient.setText(newLabel);
        if (newIcon !== this.gradient.getIcon()) {
            if (this.gradient.getIcon())
                this.gradient.getIcon().destroy();
            this.gradient.setIcon(newIcon);
        }
    }

    _closeMenu() {
        if ((this.menu) && (this.menu.isOpen)) {
            this.menu.close(false, true);
            this.sendWindow = null;
        }
    }

    _cleanAppmenu() {
        this._closeMenu();
        this.menu = null;
        this.gradient.setIcon(null);
        this.gradient.setText("");
    }

    _getIconSize() {
        let iconSize;
        let ui_scale = global.ui_scale;
        if (!ui_scale) ui_scale = 1;
        if (this._scaleMode)
            iconSize = this._panelHeight * Applet.COLOR_ICON_HEIGHT_FACTOR / ui_scale;
        else
            iconSize = Applet.FALLBACK_ICON_HEIGHT;
        return iconSize;
    }

    _onAppletEnterEvent() {
        if (this.currentWindow) {
            if (this.indicatorDbus && (this.currentWindow !== this.sendWindow)) {
                this.indicatorDbus.updateMenuForWindow(this.currentWindow);
                this.sendWindow = this.currentWindow;
            }
        }
        if ((this.menu) && (this.openOnHover))
            this.menu.open(true);
    }

    on_orientation_changed(orientation) {
        this.orientation = orientation;
        this.menuFactory.setMainMenuArrowSide(orientation);
        this._applet_context_menu.setArrowSide(orientation);
    }

    on_panel_height_changed() {
        let iconSize = this._getIconSize();
        if (this.indicatorDbus) {
            this.indicatorDbus.setIconSize(iconSize);
            this._onAppmenuChanged(this.indicatorDbus, this.currentWindow);
        }
    }

    on_applet_added_to_panel() {
        this._onReplaceAppMenuChanged();
        super.on_applet_added_to_panel.call(this);
    }

    on_applet_removed_from_panel() {
        let temp = this.replaceAppMenu;
        this.replaceAppMenu = false;
        this._onReplaceAppMenuChanged();
        this.replaceAppMenu = temp;
        let parent = this.actor.get_parent();
        if (parent) {
            parent.remove_actor(this.actor);
        }
        if (this.indicatorDbus) {
            if (this._indicatorId !== 0) {
                this.indicatorDbus.disconnect(this._indicatorId);
                this._indicatorId = 0;
            }
            this.indicatorDbus.destroy();
            this.indicatorDbus = null;
        }
        this._finalizeEnvironment();
        this.keybindingManager.destroy();
        this.hubProvider.disable();
        if (this._overviewHidingId !== 0) {
            Main.overview.disconnect(this._overviewHidingId);
            this._overviewHidingId = 0;
        }
        if (this._overviewShowingId !== 0) {
            Main.overview.disconnect(this._overviewShowingId);
            this._overviewShowingId = 0;
        }
        if (this._showsAppMenuId) {
            this._gtkSettings.disconnect(this._showsAppMenuId);
            this._showsAppMenuId = 0;
        }
        if (this._appStateChangedSignalId !== 0) {
            this.appSys.disconnect(this._appStateChangedSignalId);
            this._appStateChangedSignalId = 0;
        }
        if (this._switchWorkspaceNotifyId !== 0) {
            global.window_manager.disconnect(this._switchWorkspaceNotifyId);
            this._switchWorkspaceNotifyId = 0;
        }
        if (this.targetApp) {
            if (this._appMenuNotifyId !== 0)
                this.targetApp.disconnect(this._appMenuNotifyId);
            if (this._actionGroupNotifyId !== 0)
                this.targetApp.disconnect(this._actionGroupNotifyId);
            if (this._busyNotifyId !== 0)
                this.targetApp.disconnect(this._busyNotifyId);
        }
    }

    on_applet_clicked(event) {
        if ((this.menu) && (event.get_button() === 1)) {
            this.menu.forcedToggle();
            return true;
        }
        return false;
    }

    execInstallLanguage() {
        let localeFolder = Gio.file_new_for_path(`${GLib.get_home_dir()}/.local/share/locale`);
        Gettext.bindtextdomain(this.uuid, localeFolder.get_path());
        try {
            let moFolder = Gio.file_new_for_path(`${localeFolder.get_parent().get_path()}/gnome-shell/extensions/${this.uuid}/po/mo/`);
            let children = moFolder.enumerate_children('standard::name,standard::type,time::modified',
                Gio.FileQueryInfoFlags.NONE, null);
            let info, child, moFile, moLocale, moPath, src, dest, modified, destModified;
            while ((info = children.next_file(null)) !== null) {
                modified = info.get_modification_time().tv_sec;
                if (info.get_file_type() === Gio.FileType.REGULAR) {
                    moFile = info.get_name();
                    if (moFile.substring(moFile.lastIndexOf(".")) === ".mo") {
                        moLocale = moFile.substring(0, moFile.lastIndexOf("."));
                        moPath = `${localeFolder.get_path()}/${moLocale}/LC_MESSAGES/`;
                        src = Gio.file_new_for_path(String(`${moFolder.get_path()}/${moFile}`));
                        dest = Gio.file_new_for_path(String(`${moPath}${this.uuid}.mo`));
                        try {
                            if (dest.query_exists(null)) {
                                destModified = dest.query_info('time::modified', Gio.FileQueryInfoFlags.NONE, null).get_modification_time().tv_sec;
                                if ((modified > destModified)) {
                                    src.copy(dest, Gio.FileCopyFlags.OVERWRITE, null, null);
                                }
                            } else {
                                this._makeDirectoy(dest.get_parent());
                                src.copy(dest, Gio.FileCopyFlags.OVERWRITE, null, null);
                            }
                        } catch (e) {
                            global.logWarning(`Error: ${e.message}`);
                        }
                    }
                }
            }
        } catch (e) {
            global.logWarning(`Error: ${e.message}`);
        }
    }

    _isDirectory(fDir) {
        try {
            let info = fDir.query_filesystem_info("standard::type", null);
            if ((info) && (info.get_file_type() !== Gio.FileType.DIRECTORY))
                return true;
        } catch (e) {
        }
        return false;
    }

    _makeDirectoy(fDir) {
        if (!this._isDirectory(fDir))
            this._makeDirectoy(fDir.get_parent());
        if (!this._isDirectory(fDir))
            fDir.make_directory(null);
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(metadata, orientation, panel_height, instance_id);
}
