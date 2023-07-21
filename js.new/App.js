/*******************************************************************************
 *
 * $Id: App.js 81889 2013-12-11 20:43:06Z rcallaha $
 * $Date: 2013-12-11 15:43:06 -0500 (Wed, 11 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81889 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/App.js $
 *
 *******************************************************************************
 */

// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.App = Ext.extend(Ext.Viewport, {
    locationChange: false,
    historyWindow: null,
    feedbackWindow: null,
    usersWindow: null,

    initComponent: function ()
    {
        this.editableByUser = this.actor.accessCode === 1 || this.actor.accessCode === 3;
        this.notify = new Ext.Notify({});
        this.ids = ['asset-not-found', 'serial-num-mismatch', 'multiple-ci-matches', 'missing-elevation', 'missing-rus'];

        var header = [
            "<div class='header'>",
            /*
             "<div class='titleblock'>",
             "<img src='resources/images/blade_runner.png' />",
             "</div>",
             */
            "<div class='navblock'>",
            "<div class='nav'>",
            " <a target=_blank href='" + ACDC.confluenceURL + "'>Help</a>",
            " &nbsp; | &nbsp; <a href='#' onclick='app.sendFeedback();'>Feedback</a>",
            " &nbsp; | &nbsp; <a href='#' onclick='app.showUsers();'>Users</a>",
            "</div>",
            "</div>",
            //"<div class='header-info welcome secondaryBHighContrast-1'>Hi " + (this.actor.nickName ? this.actor.nickName : this.actor.firstName) + "</div>",
            "</div>"
        ].join("");


        this.footer = {
            region:  'south',
            xtype:   'panel',
            layout:  'fit',
            border:  false,
            frame:   false,
            cls:     'footer',
            margins: '0 0 0 0',
            height:  30,
            html:    [
                         "<div class='footer x-toolbar'>",
                         "<a target='_blank' title='Go to the ACDC wiki page' href='" + ACDC.confluenceURL + "'>ACDC " + this.release + " - " + this.env + "</a>",
                         "<br>",
                         "&copy; Copyright 2014 Neustar, Inc. All rights reserved. &nbsp; A&amp;TT - Automation &amp; Tools Team &nbsp; ",
                         "Web Programming -- <a href='mailto:Rob.Callahan@neustar.biz'>Rob Callahan, Principal Tool</a> &nbsp; ",
                         "Powered by -- <a href='http://www.sencha.com/'>ExtJS</a> &amp; <a href='http://us2.php.net/'>PHP</a>",
                         "</div>"
                     ].join("")

        };


        this.loginsGridPanel = new ACDC.LoginsGridPanel();

        this.assetDetails = new ACDC.AssetDetails({
            region:      'east',
            id:          'asset-details-panel',
            autoScroll:  true,
            collapsible: true,
            collapsed:   true,
            split:       false,
            title:       'Asset Details',
            width:       350,
            autoHeight: true,
            height: 'auto',
            notify:    this.notify,
            actor:     this.actor,
            tablet:    false,
            listeners: {
                scope:           this,
                afterassetsave: this.afterAssetSave,
                cancelassetedit: this.cancelAssetEdit,
                showhistory: this.showAssetHistory
            }
        });

        this.assetsGridPanel = new ACDC.AssetsGridPanel({
            id: 'list-tab',
            title: 'Assets List',
            autoScroll: true,
            autoHeight: false,
            height: 'auto',
            actor: this.actor,
            notify:    this.notify,
            app: this,
            listeners: {
                scope: this,
                gridrowclick: this.showAssetDetails
            }
        });

        this.dcLayoutPanel = new ACDC.DCLayout({
            id: 'layout-tab',
            title: 'Data Center Layout',
            imagesDir:  this.imagesDir,
            bodyCssClass: 'canvas-panel-body',
            notify:     this.notify,
            actor:      this.actor,
            listeners:  {
                scope:            this,
                showcabinetelevation: this.showCabinetElevation,
                onlocationselect: this.locationSelect,
                sendfeedback: this.sendFeedback,
                showusers: this.showUsers,
                installasset: this.installAsset,
                addasset: this.addAsset
            }
        });

        this.cabinetElevation = new ACDC.CabinetElevation({
            autoScroll: true,
            autoHeight: false,
            height: 'auto',
            region:     'center',
            id:         'cabinet-elevation-panel',
            title:      'Cabinet Elevation',
            width:      340,
            imagesDir: this.imagesDir,
            assetImages: this.assetImages,
            notify:    this.notify,
            actor:     this.actor,
            app:       this,
            listeners: {
                scope:              this,
                showcabinetdetails: this.showCabinetDetails
            }
        });
        this.cabinetShown = null;

        this.cabinetDetails = new ACDC.CabinetDetails({
            autoScroll: true,
            region:      'west',
            id:          'cabinet-details-panel',
            collapsible: true,
            collapsed:   true,
            split:       false,
            title:       'Cabinet Details',
            width:       350,
            notify:    this.notify,
            actor:     this.actor,
            app:       this
        });

        this.assetHistoryGridPanel = new ACDC.AssetHistoryGridPanel();

        this.exceptionsNavPanel = new Ext.Panel({
            region: 'west',
            id: 'exeptions-nav-panel',
            width: 200,
            html: ''
        });

        this.exceptionsGridPanel = new ACDC.ExceptionsGridPanel({
            id: 'exceptions-tab',
            region: 'center',
            //title: 'Asset Exceptions',
            autoScroll: true,
            autoHeight: false,
            height: 'auto',
            actor: this.actor,
            notify:    this.notify,
            app: this,
            listeners: {
                scope: this,
                gridrowclick: this.showAssetDetails
            }
        });


        this.locationsStore = new Ext.data.Store({
            proxy:  new Ext.data.HttpProxy({
                url: 'php/get_locations.php'
            }),
            reader: new Ext.data.JsonReader({
                root:          'locations',
                totalProperty: 'total'
            }, [
                {name: 'id', type: 'int'},
                {name: 'sysId', type: 'string'},
                {name: 'name', type: 'string'}
            ])
        });

        this.locationsStore.load({
            callback: function() {
                var i, name, id;

                var menuItems = Ext.getCmp('menu-location').menu;
                var locations = this.locationsStore.data.items;
                for (i = 0; i < locations.length; i++) {
                    name = locations[i].data.name;
                    id = locations[i].data.id;
                    menuItems.addMenuItem({
                        text:    name,
                        scope:   this,
                        locationId: id,
                        handler: function(item, e) {
                            this.dcLayoutPanel.selectionLocation(item.locationId);
                        }
                    });
                }
            },
            scope: this}
        );

        this.cmdbLocationsStore = new Ext.data.Store({
            proxy:  new Ext.data.HttpProxy({
                url: 'php/get_cmdb_locations.php'
            }),
            reader: new Ext.data.JsonReader({
                root:          'locations',
                totalProperty: 'total'
            }, [
                {name: 'sysId', type: 'string'},
                {name: 'name', type: 'string'}
            ])
        });

        this.cmdbLocationsCombo = new Ext.form.ComboBox({
            xtype:          'combo',
            id:             'cmdb-locations-combo',
            name:           'cmdbLocationsCombo',
            emptyText:      'Search Locations',
            triggerClass:   'x-form-clear-trigger',
            forceSelection: true,
            triggerAction:  'all',
            minChars:       3,
            mode:           'remote',
            store:          this.cmdbLocationsStore,
            fieldLabel:     'Location',
            valueField:     'sysId',
            displayField:   'name',
            width:          200,
            listeners:      {
                scope:  this,
                select: this.newLocation
            }
        });

        this.assetsStore = new Ext.data.Store({
            proxy:  new Ext.data.HttpProxy({
                url: 'php/assets_search.php'
            }),
            reader: new Ext.data.JsonReader({
                root:          'assets',
                totalProperty: 'total'
            }, [
                {name: 'id', type: 'int'},
                {name: 'cabinetId', type: 'int'},
                {name: 'locationId', type: 'int'},
                {name: 'label', type: 'string'},
                {name: 'displayValue', type: 'string'},
                {name: 'match', type: 'string'}
            ])
        });

        this.searchCombo = new Ext.form.ComboBox({
            xtype:          'combo',
            id:             'layout-search',
            name:           'layoutSearch',
            emptyText:      'Search Name or Serial Number',
            triggerClass:   'x-form-clear-trigger',
            forceSelection: true,
            triggerAction:  'all',
            minChars:       3,
            mode:           'remote',
            store:          this.assetsStore,
            valueField:     'id',
            displayField:   'displayValue',
            width:          200,
            listeners:      {
                scope:  this.dcLayoutPanel,
                select: this.dcLayoutPanel.assetSelected
            }
        });

        this.searchCombo.onTriggerClick = function() {
            this.clearValue();
        };


        this.businessServicesStore = new Ext.data.Store({
            proxy:  new Ext.data.HttpProxy({
                url: 'php/business_services_search.php'
            }),
            remoteSort: true,
            reader: new Ext.data.JsonReader({
                root:          'businessServices',
                totalProperty: 'total',
                idIndex: 0
            }, [
                {name: 'sysId', type: 'string'},
                {name: 'name', type: 'string'}
            ])
        });

        this.bsCombo = new Ext.form.ComboBox({
                xtype:          'combo',
                id:             'layout-searchBS',
                name:           'searchBS',
                emptyText:      'Search Business Service',
                triggerClass:   'x-form-clear-trigger',
                forceSelection: true,
                triggerAction:  'all',
                minChars:       3,
                mode:           'remote',
                store:          this.businessServicesStore,
                valueField:     'sysId',
                displayField:   'name',
                width:          200,
                listeners:      {
                    scope:  this.dcLayoutPanel,
                    select: this.dcLayoutPanel.businessServiceSelected
                }
        });

        this.bsCombo.onTriggerClick = function(combo, panel) {
            combo.clearValue();
            panel.unhighlightCabinets();
            panel.redrawCanvas();
        }.createCallback(this.bsCombo, this.dcLayoutPanel);

        this.toolbar = new Ext.Toolbar({
            items: [
                {
                    text: 'File',
                    id: 'menu-file',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text: 'Open Location',
                                id: 'menu-location',
                                menu: {
                                    xtype: 'menu',
                                    items: []
                                }
                            },
                            {
                                text: 'New Location',
                                id: 'menu-new-location',
                                scope:   this,
                                handler: this.newLocation
                            },
                            {
                                text: 'Asset',
                                menu: {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            text:    'Install',
                                            id: 'menu-install',
                                            scope:   this,
                                            handler: function () {
                                                Ext.getCmp('tabpanel').setActiveTab('layout-tab');
                                                this.installAsset();
                                            }
                                        },
                                        {
                                            text:    'Add',
                                            id: 'menu-add',
                                            scope:   this,
                                            handler: function () {
                                                Ext.getCmp('tabpanel').setActiveTab('layout-tab');
                                                this.addAsset();
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text: 'Cabinet',
                                id: 'menu-insert',
                                menu: {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            text:     'Add',
                                            disabled: !this.editableByUser,
                                            menu:     {
                                                xtype: 'menu',
                                                items: [
                                                    {
                                                        text:    'Standard 24"x36"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(1);
                                                        }
                                                    },
                                                    {
                                                        text:    'Standard 24"x43"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(3);
                                                        }
                                                    },
                                                    {
                                                        text:    'HP Blade 24"x48"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(2);
                                                        }
                                                    },
                                                    {
                                                        text:    'EMC Connectrix 30"x40"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(8);
                                                        }
                                                    },
                                                    {
                                                        text:    'EMC Symmetrix 30"x40"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(4);
                                                        }
                                                    },
                                                    {
                                                        text:    'EMC VMAX 30"x36"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(12);
                                                        }
                                                    },
                                                    {
                                                        text:    'EMC VNX 24"x36"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(13);
                                                        }
                                                    },
                                                    {
                                                        text:    'EMC 24"x38"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(5);
                                                        }
                                                    },
                                                    {
                                                        text:    'Netezza 24"x38"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(11);
                                                        }
                                                    },
                                                    {
                                                        text:    'Quest 30"x36"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(9);
                                                        }
                                                    },
                                                    {
                                                        text:    'Quantum 24"x36"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(7);
                                                        }
                                                    },
                                                    {
                                                        text:    'Verint 24"x37"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(10);
                                                        }
                                                    },
                                                    {
                                                        text:    'Battery 48"x34"',
                                                        scope:   this,
                                                        handler: function () {
                                                            this.dcLayoutPanel.insertCabinet(6);
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text:    'Print Layout',
                                id: 'menu-print',
                                scope:   this,
                                handler: function () {
                                    Ext.getCmp('tabpanel').setActiveTab('layout-tab');
                                    this.dcLayoutPanel.printCanvas();
                                }
                            },
                            {
                                text:    'Export',
                                id: 'menu-export',
                                scope:   this,
                                handler: function () {
                                    var activeTabId = Ext.getCmp('tabpanel').activeTab.id;
                                    if (activeTabId === 'list-tab') {
                                        this.assetsGridPanel.export();
                                    } else if (activeTabId === 'exceptions-container') {
                                        this.exceptionsGridPanel.export();
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'Edit',
                    id: 'menu-edit',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:     'Cut',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  function () {
                                    this.dcLayoutPanel.cutCabinets();
                                }
                            },
                            {
                                text:     'Copy',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  function () {
                                    this.dcLayoutPanel.copyCabinets();
                                }
                            },
                            {
                                text:     'Paste',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  function () {
                                    this.dcLayoutPanel.pasteCabinets();
                                }
                            },
                            {
                                text:     'Delete',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  function () {
                                    this.dcLayoutPanel.deleteCabinets();
                                }
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'Draw',
                    id: 'menu-draw',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:     'Line',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  function() {
                                    this.dcLayoutPanel.drawingLine = true;
                                }
                            },
                            {
                                text:     'Rectangle',
                                scope:    this,
                                disabled: !this.editableByUser,
                                handler:  this.dcLayoutPanel.drawRectangle
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'Layout',
                    id: 'menu-options',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:     'Grid',
                                menu:     {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'On',
                                            id:        "opts-grid-on",
                                            checked:   true,
                                            group:     'opts-grid',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'Off',
                                            id:        "opts-grid-off",
                                            group:     'opts-grid',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridChange
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text:     'Grid Spacing',
                                menu:     {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '6"x6"',
                                            id:        "opts-grid-spacing-1",
                                            group:     'opts-grid-spacing',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridSpacingChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '12"x12"',
                                            id:        "opts-grid-spacing-2",
                                            group:     'opts-grid-spacing',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridSpacingChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '24"x24" Floor Tiles',
                                            checked:   true,
                                            id:        "opts-grid-spacing-3",
                                            group:     'opts-grid-spacing',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridSpacingChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '48"x48"',
                                            id:        "opts-grid-spacing-4",
                                            group:     'opts-grid-spacing',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridSpacingChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '96"x96"',
                                            id:        "opts-grid-spacing-5",
                                            group:     'opts-grid-spacing',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onGridSpacingChange
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text:     'Snap',
                                disabled: !this.editableByUser,
                                menu:     {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'On',
                                            id:        "opts-snap-on",
                                            checked:   true,
                                            group:     'opts-snap',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onSnapChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'Off',
                                            id:        "opts-snap-off",
                                            group:     'opts-snap',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onSnapChange
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text:     'Zoom',
                                menu:     {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '100%',
                                            zoom:      1,
                                            checked:   true,
                                            group:     'opts-zoom',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onZoomChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '125%',
                                            zoom:      1.25,
                                            group:     'opts-zoom',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onZoomChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '150%',
                                            zoom:      1.5,
                                            group:     'opts-zoom',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onZoomChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '175%',
                                            zoom:      1.75,
                                            group:     'opts-zoom',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onZoomChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      '200%',
                                            zoom:      2,
                                            group:     'opts-zoom',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onZoomChange
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text: 'Debug',
                                menu: {
                                    xtype: 'menu',
                                    items: [
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'On',
                                            id:        "opts-debug-on",
                                            checked:   this.debug ? true : false,
                                            group:     'opts-debug',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onDebugChange
                                            }
                                        },
                                        {
                                            xtype:     'menucheckitem',
                                            text:      'Off',
                                            id:        "opts-debug-off",
                                            checked:   this.debug ? false : true,
                                            group:     'opts-debug',
                                            listeners: {
                                                scope: this.dcLayoutPanel,
                                                click: this.dcLayoutPanel.onDebugChange
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                /*
                {
                    text: 'Exceptions',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:    'Show On Cabinets',
                                scope:   this.dcLayoutPanel,
                                handler: this.dcLayoutPanel.showExceptions
                            }
                        ]
                    }
                },
                */
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'Help',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:    'ACDC Confluence Page',
                                scope:   this,
                                handler: this.showConfluencePage
                            },
                            {
                                text:    'Send Feedback',
                                scope:   this,
                                handler: this.sendFeedback
                            },
                            {
                                text:    'Show Users',
                                scope:   this,
                                handler: this.showUsers
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                this.searchCombo,
                {
                    xtype: 'tbspacer'
                },
                this.bsCombo,
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype:          'textfield',
                    id:             'grid-search',
                    name:           'gridSearch',
                    emptyText:      'Search',
                    width:          200,
                    enableKeyEvents: true,
                    listeners:      {
                        scope: this,
                        keyup: this.gridSearch
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'button',
                    id: 'show-capacity-button',
                    text: 'Show Capacity',
                    cls: 'acdc-btn',
                    enableToggle: true,
                    scope: this.dcLayoutPanel,
                    handler: this.dcLayoutPanel.toggleShowCapacity
                },
                {
                    xtype: 'button',
                    id: 'show-exceptions-button',
                    text: 'Show Exceptions',
                    cls: 'acdc-btn',
                    enableToggle: true,
                    scope: this.dcLayoutPanel,
                    handler: this.dcLayoutPanel.toggleShowExceptions
                },
                {
                    xtype: 'button',
                    id: 'bulk-edit-button',
                    text: 'Bulk Edit',
                    cls: 'acdc-btn',
                    scope: this.assetsGridPanel,
                    handler: this.assetsGridPanel.bulkEdit
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbtext',
                    text: 'Location:',
                    id:   'location-group-label'
                },
                {
                    text: 'Sterling',
                    id:   'location-group',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                xtype:   'menucheckitem',
                                text:    'Sterling',
                                id:      'location-cb-sterling',
                                group:   'locationCbGroup',
                                checked: true,
                                scope:   this,
                                handler: this.gridLocationChanged
                            },
                            {
                                xtype:   'menucheckitem',
                                text:    'Charlotte',
                                id:      'location-cb-charlotte',
                                group:    'locationCbGroup',
                                scope:   this,
                                handler: this.gridLocationChanged
                            },
                            {
                                xtype:   'menucheckitem',
                                text:    'Other',
                                id:      'location-cb-other',
                                group:    'locationCbGroup',
                                scope:   this,
                                handler: this.gridLocationChanged
                            },
                            {
                                xtype:   'menucheckitem',
                                text:    'All',
                                id:      'location-cb-all',
                                group:    'locationCbGroup',
                                scope:   this,
                                handler: this.gridLocationChanged
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'State:',
                    id:   'state-group-label'
                },
                {
                    xtype:   'checkbox',
                    boxLabel:    'Installed',
                    id:      'state-Installed',
                    checked: true,
                    scope:   this,
                    handler: this.gridSearch
                },
                {
                    xtype:   'checkbox',
                    boxLabel:    'In Transit',
                    id:      'state-In Transit',
                    checked: true,
                    scope:   this,
                    handler: this.gridSearch
                },
                {
                    xtype:   'checkbox',
                    boxLabel:    'Decommed',
                    id:      'state-Decommed',
                    checked: true,
                    scope:   this,
                    handler: this.gridSearch
                },
                {
                    xtype:   'checkbox',
                    boxLabel:    'Awaiting Disposal',
                    id:      'state-Awaiting Disposal',
                    checked: true,
                    scope:   this,
                    handler: this.gridSearch
                },
                {
                    xtype:   'checkbox',
                    boxLabel:    'Disposed',
                    id:      'state-Disposed',
                    checked: true,
                    scope:   this,
                    handler: this.gridSearch
                },
                {
                    xtype: 'tbfill'
                },
                {
                    xtype: 'button',
                    text: 'Play Promo Video',
                    iconCls: 'video',
                    listeners: {
                        scope: this,
                        click: this.playVideo
                    }
                }
            ]
        });


        var items = [
             {
                 region:       'north',
                 title:        'ACDC - Assets Contained in Data Centers',
                 tbar:         this.toolbar,
                 margins:      '0 0 0 0',
                 height:       0,
                 html:         "",
                 bodyCssClass: 'header'
             },
             {
                 region:     'center',
                 xtype:      'tabpanel',
                 id:         'tabpanel',
                 autoScroll: false,
                 autoHeight: false,
                 activeTab:  0,
                 items:      [
                     this.dcLayoutPanel,
                     this.assetsGridPanel,
                     {
                         xtype: 'panel',
                         title: 'Asset Exceptions',
                         id: 'exceptions-container',
                         layout: 'border',
                         items: [
                             this.exceptionsNavPanel,
                             this.exceptionsGridPanel
                         ]
                     }
                 ],
                 listeners: {
                    scope: this,
                    tabchange: function(tabPanel, tab) {
                        var me = this;

                        // load the assets grid if this is the active tab and they haven't been loaded yet
                        if (tabPanel.activeTab.id !== 'layout-tab') {
                            if (tabPanel.activeTab.id === 'list-tab' && me.assetsGridPanel.store.getCount() === 0) {
                                me.assetsGridPanel.store.load();
                            }
                            if (tabPanel.activeTab.id === 'exceptions-container' && me.exceptionsGridPanel.store.getCount() === 0) {
                                var mgr = me.exceptionsNavPanel.getUpdater();
                                mgr.on('update', me.defineExceptionsNavEvents, me);
                                mgr.update({
                                    url: "php/get_asset_exceptions_nav.php",
                                    params: {
                                        dataType: 'html'
                                    }
                                });
                            }

                            // clear contents of east panel (elevation, asset details) and close
                            me.assetDetails.clearData();
                            me.cabinetElevation.clearDetails();
                            me.cabinetDetails.clearData();
                            Ext.getCmp('east-panel').collapse();
                        }

                        // call the function to change the toolbar options (enable/disable) based upon which tab is now active
                        me.toggleMenuOptions(tabPanel.activeTab.id);
                    }
                 }
             },
             {
                 region:      'east',
                 id:          'east-panel',
                 autoScroll:  false,
                 collapsible: true,
                 collapsed:   true,
                 split:       true,
                 width:       380,
                 layout:      'border',
                 items:       [
                     this.cabinetDetails,
                     this.cabinetElevation,
                     this.assetDetails
                 ]
             }
         ];

        // don't show footer for tablet as it has a tendency to display in the middle of the screen. WTF?
        if (this.agent === 'desktop') {
            items.push(this.footer);
        }

        Ext.apply(this, {
            renderTo: document.body,
            layout:   'border',
            items:    items
         });

        ACDC.App.superclass.initComponent.apply(this, arguments);
    },

    defineExceptionsNavEvents: function(panel, params) {
        var me = this;
        for (var i=0; i<me.ids.length; i++) {
            Ext.get(me.ids[i]).on('click', me.loadExceptions, me, {id: me.ids[i]});
        }
        me.loadExceptions(null, null, {id:'asset-not-found'});
        me.exceptionsGridPanel.exceptionsTypeId = 'asset-not-found';
    },

    loadExceptions: function(e, el, params) {
        var me = this;
        me.exceptionsGridPanel.exceptionsTypeId = params.id;
        me.exceptionsGridPanel.store.baseParams.exceptionType = params.id;
        me.exceptionsGridPanel.store.load();

        for (var i=0; i<me.ids.length; i++) {
            Ext.get('td1-' + me.ids[i]).removeClass('exceptions-selected');
            Ext.get('td2-' + me.ids[i]).removeClass('exceptions-selected');
        }
        Ext.get('td1-' + params.id).addClass('exceptions-selected');
        Ext.get('td2-' + params.id).addClass('exceptions-selected');
    },

    afterRender: function () {
        ACDC.App.superclass.afterRender.apply(this, arguments);
    },

    newLocation: function () {
        var form;

        if (typeof this.newLocationWindow === "undefined" || this.newLocationWindow === null) {
            this.newLocationWindow = new Ext.Window({});

            form = new Ext.form.FormPanel({
                //border: false,
                layout:       'form',
                frame:        true,
                labelWidth:   100,
                defaultType:  'textfield',
                monitorValid: true,
                items:        [
                    this.cmdbLocationsCombo
                ],
                buttons:      [
                    {
                        text:     'Create',
                        formBind: true,
                        scope:    this,
                        handler:  function ()
                        {
                            Ext.Ajax.request(
                                {
                                    url:    'php/create_location.php',
                                    params: {
                                        'locationSysId': this.cmdbLocationsCombo.getValue()
                                    },
                                    scope:  this,
                                    mycallback: function (json) {
                                        this.dcLayoutPanel.selectionLocation(json.id);
                                    }
                                });
                            this.newLocationWindow.close();
                        }
                    },
                    {
                        text:    'Cancel',
                        scope: this,
                        handler: function ()
                        {
                            this.newLocationWindow.close();
                        }
                    }
                ]
            });

            // create and show window
            this.newLocationWindow = new Ext.Window({
                title:     'New Location',
                modal:     true,
                constrain: true,
                width:     350,
                height:    150,
                layout:    'fit',
                closable:  false,
                border:    false,
                items:     [
                    form
                ],
                listeners: {
                       beforeclose: function() {
                           this.hide();
                           return false;
                       }
                }
            });
        }

        this.newLocationWindow.show();
    },

    gridLocationChanged: function(radio, e)
    {
        var locationKey,
            nodes,
            matches;

        // get the node of the menu button so we can updated the text, eg., from Sterling to Charlotte
        nodes = Ext.query("table[id='location-group'] button");

        // get the last char string in the id which will be the location in lower case
        matches = radio.id.match(/location-cb-(\w+)/);
        locationKey = matches[1];

        // update the menu pull down text to the the capitalized location name
        nodes[0].innerHTML = Ext.util.Format.capitalize(locationKey);

        this.assetsGridPanel.locationKey = locationKey;
        this.assetsGridPanel.store.baseParams.locationKey = locationKey;
        this.assetsGridPanel.store.load();
    },

    gridSearch: function(textField, e)
    {
        var searchString = Ext.getCmp('grid-search').getValue(),
            valueString,
            re,
            cb,
            stateValues = ["Installed", "In Transit", "Decommed", "Awaiting Disposal", "Disposed"],
            stateChecked = [];

        // create an array of checked state checkboxes
        for (var i=0; i<stateValues.length; i++) {
            cb = Ext.getCmp('state-' + stateValues[i]);
            if (cb.checked) {
                stateChecked.push(stateValues[i]);
            }
        }

        // the grid filter implementation
        // first we check the state against the checked states
        // then we check against a search string if specified
        // we concatenate several of the record's columns with a pipe separator. This allows us to search one long
        // string (valueString ) rather than having to do a search on each column.
        this.assetsGridPanel.store.filter([{
            fn: function (record) {
                var state = record.get('state'),
                    match = false;

                // state value check against the checked checkboxes
                for (i = 0; i < stateChecked.length; i++) {
                    re = new RegExp(stateChecked[i], "i");
                    if (state.search(re) !== -1) {
                        match = true;
                    }
                }

                // if we've matched so far and the search box contains a value..
                if (match && searchString) {
                    // create a reusable regexp to search on. This enables us to use a variable in its construction
                    re = new RegExp(searchString, "i");
                    valueString = record.get('name') + '|' +
                        record.get('label') + '|' +
                        record.get('cabinet') + '|' +
                        record.get('serialNumber') + '|' +
                        record.get('manufacturer') + '|' +
                        record.get('model') + '|' +
                        record.get('businessService') + '|' +
                        record.get('subsystem');
                    match = valueString.search(re) !== -1;
                }
                return match;
            }
        }])
    },

    showAssetDetails: function(grid, assetId, rowIndex)
    {
        Ext.getCmp('east-panel').expand();
        Ext.getCmp('cabinet-details-panel').collapse();
        Ext.getCmp('asset-details-panel').expand();
        this.assetDetails.rowIndex = rowIndex;
        this.assetDetails.calledFrom = 'grid';
        this.assetDetails.showAsset(assetId);
    },

    toggleMenuOptions: function(tabId)
    {
        var layoutMenuItems = ['menu-location', 'menu-install', 'menu-add', 'menu-print', 'menu-edit', 'menu-insert', 'menu-options'],
            gridMenuItems = ['menu-export'],
            layoutShowItems = ['layout-search', 'layout-searchBS', 'show-capacity-button', 'show-exceptions-button'],
            gridShowItems = ['bulk-edit-button', 'grid-search', 'location-group-label', 'location-group', 'state-group-label', 'state-Installed', 'state-In Transit', 'state-Decommed', 'state-Awaiting Disposal', 'state-Disposed'],
            i;

        for (i=0; i<layoutMenuItems.length; i++) {
            tabId === 'layout-tab' ? Ext.getCmp(layoutMenuItems[i]).enable() : Ext.getCmp(layoutMenuItems[i]).disable();
        }
        for (i=0; i<gridMenuItems.length; i++) {
            tabId === 'list-tab' ? Ext.getCmp(gridMenuItems[i]).enable() : Ext.getCmp(gridMenuItems[i]).disable();
        }

        if (tabId === 'layout-tab') {
            for (i=0; i<layoutShowItems.length; i++) {
                Ext.getCmp(layoutShowItems[i]).show();
            }
            for (i=0; i<gridShowItems.length; i++) {
                Ext.getCmp(gridShowItems[i]).hide();
            }
        } else if (tabId === 'list-tab') {
            for (i=0; i<layoutShowItems.length; i++) {
                Ext.getCmp(layoutShowItems[i]).hide();
            }
            for (i=0; i<gridShowItems.length; i++) {
                Ext.getCmp(gridShowItems[i]).show();
            }
        } else {
            for (i=0; i<layoutShowItems.length; i++) {
                Ext.getCmp(layoutShowItems[i]).hide();
            }
            for (i=0; i<gridShowItems.length; i++) {
                Ext.getCmp(gridShowItems[i]).hide();
            }

            Ext.getCmp('menu-export').enable();
        }
    },

    installAsset: function()
    {
        this.assetDetails.cancelEdit(null, null);
        this.cabinetDetails.clearData();

        Ext.getCmp('east-panel').expand();
        Ext.getCmp('cabinet-details-panel').collapse();
        Ext.getCmp('asset-details-panel').expand();

        this.assetDetails.installAsset();
    },

    addAsset: function()
    {
        this.assetDetails.cancelEdit(null, null);
        this.cabinetDetails.clearData();

        Ext.getCmp('east-panel').expand();
        Ext.getCmp('cabinet-details-panel').collapse();
        Ext.getCmp('asset-details-panel').expand();

        this.assetDetails.addAsset();
    },

    locationSelect: function ()
    {
        this.locationChange = true;

        // TODO: should not be using a fire event in next function. need to have a callback instead
        this.assetDetails.cancelEdit(null, null);
        this.cabinetDetails.clearData();
    },

    showCabinetElevation: function (panel, cabinet, assetId)
    {
        this.cabinetDetails.clearData();
        this.assetDetails.cancelEdit(null, null);

        Ext.getCmp('east-panel').expand();
        Ext.getCmp('cabinet-details-panel').collapse();
        Ext.getCmp('asset-details-panel').collapse();

        this.cabinetShown = cabinet;
        this.cabinetElevation.getCabinetElevation(cabinet, assetId)
    },

    showCabinetDetails: function(panel, cabinet)
    {
        Ext.getCmp('asset-details-panel').collapse();
        Ext.getCmp('cabinet-details-panel').expand();

        this.cabinetDetails.show(cabinet);
    },

    afterAssetSave: function(assetDetailsPanel, changes, assetId, newFromCmdb)
    {
        var tabPanel = Ext.getCmp('tabpanel'),
            change,
            rowIndex,
            dataRow;

        if (tabPanel.activeTab.id === 'layout-tab') {
            this.dcLayoutPanel.getCabinetElevation(this.cabinetShown);
        } else if (tabPanel.activeTab.id === 'list-tab') {
            Ext.getCmp('east-panel').collapse();

            // get the assetsGridPanel data store row for this assetId
            rowIndex = this.assetsGridPanel.store.data.keys.indexOf(assetId);
            dataRow = this.assetsGridPanel.store.getAt(rowIndex);
            for (var i=0; i<changes.length; i++) {
                change = changes[i];
                dataRow.set(change.name, change.value);
                dataRow.commit();
            }
        } else if (tabPanel.activeTab.id === 'exceptions-tab') {
            // get the assetsGridPanel data store row for this assetId
            rowIndex = this.exceptionsGridPanel.store.data.keys.indexOf(assetId);

            if (newFromCmdb) {
                rowIndex = this.exceptionsGridPanel.store.data.keys.indexOf(assetId);
                this.exceptionsGridPanel.store.removeAt(rowIndex);
            } else {
                dataRow = this.exceptionsGridPanel.store.getAt(rowIndex);
                for (var i=0; i<changes.length; i++) {
                    change = changes[i];
                    dataRow.set(change.name, change.value);
                    dataRow.commit();
                }
            }
            this.assetDetails.showAsset(assetId);
        }

    },

    cancelAssetEdit: function () {
        Ext.getCmp('asset-details-panel').collapse();

        if (this.locationChange) {
            this.cabinetElevation.clearDetails();
            Ext.getCmp('east-panel').collapse();

            this.dcLayoutPanel.getCabinets();
            this.dcLayoutPanel.getLines();
            this.locationChange = false;
        }
    },

    showAssetHistory: function(panel, assetId)
    {
        if (this.historyWindow === null) {
            // create and show window
            this.historyWindow = new Ext.Window({
                title:      'ACDC Asset History',
                modal:      true,
                constrain:  true,
                width:      1000,
                height:     600,
                layout:     'fit',
                closable:   true,
                border:     false,
                autoScroll: true,
                items:      [
                    this.assetHistoryGridPanel
                ],
                listeners: {
                       beforeclose: function() {
                           this.hide();
                           return false;
                       }
                }
            });
        }

        this.historyWindow.show();
        this.assetHistoryGridPanel.getStore().load({
            params: {
                assetId: assetId
            }
        });
    },

    /* standard methods */
    sendFeedback:    function () {
        var form;

        if (this.feedbackWindow === null) {
            this.feedbackWindow = new Ext.Window({});

            form = new Ext.form.FormPanel({
                //border: false,
                layout:       'form',
                frame:        true,
                labelWidth:   100,
                defaultType:  'textfield',
                monitorValid: true,
                items:        [
                    {
                        id:         'emailFrom',
                        name:       'emailFrom',
                        fieldLabel: 'From',
                        width:      380,
                        grow:       false,
                        disabled:   true,
                        value:      this.actor.email
                    },
                    {
                        id:         'emailSubject',
                        name:       'emailSubject',
                        fieldLabel: 'Subject',
                        width:      380,
                        grow:       false,
                        disabled:   true,
                        value:      "ACDC Feedback"
                    },
                    {
                        xtype:      'checkboxgroup',
                        fieldLabel: 'Feedback Type',
                        name:       'feedbackType',
                        items:      [
                            {
                                boxLabel:  'Bug',
                                listeners: {
                                    "check": function (checkbox, checked)
                                    {
                                        if (checked) {
                                            Ext.get('emailSubject').dom.value = "ACDC Bug Report";
                                        }
                                    }
                                }
                            },
                            {
                                boxLabel:  'Request',
                                listeners: {
                                    "check": function (checkbox, checked)
                                    {
                                        if (checked) {
                                            Ext.get('emailSubject').dom.value = "ACDC Feature Request";
                                        }
                                    }
                                }
                            },
                            {
                                boxLabel:  'Feedback',
                                listeners: {
                                    "check": function (checkbox, checked)
                                    {
                                        if (checked) {
                                            Ext.get('emailSubject').dom.value = "ACDC Feedback";
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype:      'textarea',
                        id:         'emailBody',
                        name:       'emailBody',
                        fieldLabel: "Comments",
                        allowBlank: false,
                        width:      '100%',
                        grow:       false,
                        height:     200,
                        minLength:  3
                    }
                ],
                buttons:      [
                    {
                        text:     'Send',
                        formBind: true,
                        scope:    this,
                        handler:  function ()
                        {
                            if (typeof form.form.getFieldValues()['feedbackType'] == "undefined") {
                                Ext.Msg.show({
                                    title:   'ERROR',
                                    msg:     'You must specify an feedback type.',
                                    buttons: Ext.Msg.OK,
                                    icon:    Ext.MessageBox.ERROR
                                });
                                return;
                            }

                            Ext.Ajax.request(
                                {
                                    url:    'php/send_feedback.php',
                                    params: {
                                        'emailFrom':    Ext.get('emailFrom').dom.value,
                                        'emailSubject': Ext.get('emailSubject').dom.value,
                                        'emailBody':    Ext.get('emailBody').dom.value
                                    },
                                    scope:  this,

                                    mycallback: function ()
                                    {
                                        this.notify.setAlert(this.notify.STATUS_INFO, "Thanks!<br>Your email has been sent", 3);
                                    }
                                });
                            this.feedbackWindow.close();
                        }
                    },
                    {
                        text:    'Cancel',
                        scope: this,
                        handler: function ()
                        {
                            this.feedbackWindow.close();
                        }
                    }
                ]
            });

            // create and show window
            this.feedbackWindow = new Ext.Window({
                title:     'Bug Report, Feature Request or General Feedback',
                modal:     true,
                constrain: true,
                width:     600,
                height:    400,
                layout:    'fit',
                closable:  false,
                border:    false,
                items:     [
                    form
                ],
                listeners: {
                       beforeclose: function() {
                           this.hide();
                           return false;
                       }
                }
            });
        }

        this.feedbackWindow.show();
    },

    showUsers: function () {
        if (this.usersWindow === null) {
            // create and show window
            this.usersWindow = new Ext.Window({
                title:      'ACDC User Logins',
                modal:      true,
                constrain:  true,
                width:      1000,
                height:     600,
                layout:     'fit',
                closable:   true,
                border:     false,
                autoScroll: true,
                items:      [
                    this.loginsGridPanel
                ],
                listeners: {
                       beforeclose: function() {
                           this.hide();
                           return false;
                       }
                }
            });
        }

        this.usersWindow.show();
        this.loginsGridPanel.getStore().load();
    },

    /* Exceptions Menu */
    showExceptions: function(reportType) {
        window.open("php/show_exception_report.php?reportType=" + reportType, "_blank");
    },

    playVideo: function()
    {
        window.open("movie/index.html", "_blank");
    },

    /* Help menu */
    showConfluencePage: function() {
        window.open(ACDC.confluenceURL, "_blank");
    }

});


