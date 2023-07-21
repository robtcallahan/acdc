// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.AssetsGridPanel = Ext.extend(Ext.grid.GridPanel, {
    location: {
        id: 0,
        name: 'All Locations'
    },
    locationId: this.location.id,  // all locations
    bulkEditWindow: null,

    initComponent: function () {
        this.addEvents(
            'gridrowclick'
        );

        this.stateCombo = new ACDC.EditorComboBox({
            itemName: 'state',
            id:          'bulk-state-combo',
            emptyText: 'State',
            fieldLabel:  'State'
        });

        var store = new Ext.data.Store({
            baseParams: {
                locationId: this.locationId
            },
            proxy: new Ext.data.HttpProxy(
                {
                    url: 'php/get_assets.php',
                    mycallback: function() {
                    }
                }),
            reader: new Ext.data.JsonReader(
                {
                    root: 'assets',
                    totalProperty: 'count'
                }, [
                    {name: 'id', type: 'int'},
                    {name: 'name', type: 'string'},
                    {name: 'label', type: 'string'},
                    {name: 'location', type: 'string'},
                    {name: 'cabinet', type: 'string'},
                    {name: 'serialNumber', type: 'string'},
                    {name: 'assetTag', type: 'string'},
                    {name: 'businessService', type: 'string'},
                    {name: 'subsystem', type: 'string'},
                    {name: 'manufacturer', type: 'string'},
                    {name: 'model', type: 'string'},
                    {name: 'elevation', type: 'string'},
                    {name: 'numRUs', type: 'string'},
                    {name: 'state', type: 'string'}
                ])
        }); // eo store object

        // set the default sort
        store.setDefaultSort('label', 'ASC');

        var cbSelModel = new Ext.grid.CheckboxSelectionModel({
            checkOnly: true,
            listeners: {
                scope:     this,
                rowselect: function (selectionModel, rowIndex, record) {
                }
            }
        });

        // define the column model for the grid
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                width:    100
            },
            columns:  [
                cbSelModel,
                new Ext.grid.RowNumberer({width: 35}),
                {
                    header:    "Name",
                    dataIndex: 'name',
                    width:     140
                }, {
                    header:    "Label",
                    dataIndex: 'label'
                }, {
                    header:    "Location",
                    dataIndex: 'location'
                }, {
                    header:    "Rack",
                    dataIndex: 'cabinet',
                    width: 50
                }, {
                    header:    "Serial Num",
                    dataIndex: 'serialNumber'
                }, {
                    header:    "Asset Tag",
                    dataIndex: 'assetTag'
                }, {
                    header:    "Manufacturer",
                    dataIndex: 'manufacturer'
                }, {
                    header:    "Model",
                    dataIndex: 'model'
                }, {
                    header:    "Elevation",
                    dataIndex: 'elevation',
                    width: 50
                }, {
                    header:    "RUs",
                    dataIndex: 'numRUs',
                    width: 50
                }, {
                    header:    "State",
                    dataIndex: 'state'
                }, {
                    header:    "Business Service",
                    dataIndex: 'businessService',
                    width: 140
                }, {
                    header:    "Subsystem",
                    dataIndex: 'subsystem'
                }
            ]
        });

        // apply config
        Ext.apply(this, {
            stripeRows:  true,
            columnWidth: .5,
            margins:     '0 0 0 0',
            loadMask:    {
                msg: "Loading assets..."
            },
            store:       store,
            cm:          colModel,
            sm:          cbSelModel,
            viewConfig:  {
                forceFit:     true,
                scrollOffset: 0
            },
            listeners: {
                scope: this,
                rowclick: this.onRowClick
            }
        });

        // call parent
        ACDC.AssetsGridPanel.superclass.initComponent.apply(this, arguments);
    },

    afterRender: function() {
        // select the All locations menu item
        Ext.getCmp('location-group').setText(this.location.name);

        ACDC.AssetsGridPanel.superclass.afterRender.call(this);
    },

    onRowClick: function(grid, rowIndex, e) {
        var className = e ? e.target.className : '',
            assetId = grid.store.getAt(rowIndex).get('id');

        // we don't want to open the asset details panel if we click on the checkbox
        if (className !== "x-grid3-row-checker") {
            // row was clicked, so fire the event that will load the asset into the asset details panel
            this.fireEvent('gridrowclick', this, assetId, rowIndex);
        }
    },

    showAsset: function(data) {
        var location = {
            id: 0,
            name: 'All'
        };

        this.store.on("load", function() {
            Ext.getCmp('grid-search').setValue(data.displayValue);
            this.app.gridSearch();
            this.onRowClick(this, 0);
            this.store.un("load", function() {
                this.app.gridSearch();
            })
        }, this);

        Ext.getCmp('state-Installed').el.dom.checked = false;
        Ext.getCmp('state-In Transit').el.dom.checked = true;
        Ext.getCmp('state-Inventory').el.dom.checked = true;
        Ext.getCmp('state-Decommed').el.dom.checked = false;
        Ext.getCmp('state-Awaiting Disposal').el.dom.checked = false;
        Ext.getCmp('state-Disposed').el.dom.checked = false;
        this.locationSelected(location);

    },

    bulkEdit: function () {
        var selections = this.getSelectionModel().getSelections(),
            info = 'You are about to change the State value of ' + selections.length + ' assets.<br> Please be sure that you want to do this.<br> If so, select the desired State value and click "Save"',
            form;



        if (this.bulkEditWindow === null) {
            form = new Ext.form.FormPanel({
                layout:       'form',
                frame:        true,
                labelWidth:   130,
                defaultType:  'textfield',
                monitorValid: true,
                items:        [
                    {
                        xtype:    'label',
                        id: 'bulk-edit-info',
                        html:     info,
                        cls:      'form-text',
                        disabled: false
                    },
                    {
                        xtype: 'label',
                        html:  '<br><br>'
                    },
                    this.stateCombo
                ],
                buttons:      [
                    {
                        text:     'Save',
                        formBind: true,
                        scope:    this,
                        handler:  function () {
                            this.saveBulkEdits();
                        }
                    },
                    {
                        text:    'Cancel',
                        scope:   this,
                        handler: function () {
                            this.bulkEditWindow.hide();
                        }
                    }
                ]
            });

            // create and show window
            this.bulkEditWindow = new Ext.Window({
                title:     'Bulk Edit',
                modal:     true,
                constrain: true,
                width:     600,
                height:    240,
                layout:    'fit',
                closable:  false,
                border:    false,
                items:     [
                    form
                ],
                listeners: {
                    beforeclose: function () {
                        this.hide();
                        return false;
                    }
                }
            });
        } else {
            Ext.getCmp('bulk-edit-info').getEl().dom.innerHTML = info;
        }

        this.bulkEditWindow.show();
        Ext.getCmp('bulk-state-combo').focus();
    },

    saveBulkEdits: function () {
        var combo = Ext.getCmp('bulk-state-combo'),
            stateName = combo.getValue(),
            store = combo.getStore(),
            index = store.find('name', stateName),
            rec = store.getAt(index),
            stateId = rec.get('id'),
            selections = this.getSelectionModel().getSelections(),
            assetIds = [],
            i;

        this.bulkEditWindow.hide();

        for (i=0; i<selections.length; i++) {
            assetIds.push(selections[i].get('id'));
        }

        this.ajaxSave(stateId, assetIds);
    },

    ajaxSave: function(stateId, assetIds) {
        this.loadMask.show("Saving changes...");

        Ext.Ajax.request({
            url:             'php/save_bulk_changes.php',
            params:          {
                stateId: stateId,
                assetIds: Ext.util.JSON.encode(assetIds)
            },
            scope:           this,
            mycallback:      function (json, options) {
                var selections = this.getSelectionModel().getSelections();

                this.loadMask.hide();

                // tell the user what happened
                if (json.message !== "") {
                    this.notify.setAlert(this.notify.STATUS_INFO, json.message, 5);
                } else {
                    this.notify.setAlert(this.notify.STATUS_INFO, "Assets updated", 3);
                }

                // reload the grid so that the changes will be seen and checkboxes are unchecked
                this.getStore().load({
                    scope: this.app,
                    callback: this.app.gridSearch
                });

            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    exportGrid: function () {
        // create the form in HTML
        var html = "<span class='csv-message'>Generating MicroSquish Excel file...</span>\n",
            win,
            task,
            items = this.store.data.items,
            jsonData = [];

        for (var i=0; i<items.length; i++) {
            jsonData.push(items[i].data);
        }

        html += "<form name='exportForm' id='exportForm' method='post' action='php/export_assets.php'>\n" +
                "  <input type='hidden' name='json' value='" + Ext.util.JSON.encode(jsonData) + "'>\n" +
                "</form>\n";

        // open a window and submit the form
        win = new Ext.Window({
            modal:      true,
            constrain:  true,
            height:     60,
            width:      200,
            autoScroll: true,
            items:      [
                {
                    html: html
                }
            ]
        });
        win.render(document.body);
        win.center();
        win.show();

        task = new Ext.util.DelayedTask();
        task.delay(2000, this.submitExportForm, this, [win]);
    },

    submitExportForm: function (win) {
        Ext.get('exportForm').dom.submit();
        win.close();
    },

    locationSelected: function(location) {
        Ext.getCmp('location-group').setText(location.name);

        this.locationId = location.id;
        this.store.baseParams.locationId = location.id;
        this.store.load();
    }

});