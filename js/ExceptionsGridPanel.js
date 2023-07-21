/*******************************************************************************
 * $Id: ExceptionsGridPanel.js 81889 2013-12-11 20:43:06Z rcallaha $
 * $Date: 2013-12-11 15:43:06 -0500 (Wed, 11 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81889 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ExceptionsGridPanel.js $
 *
 *******************************************************************************
 */

    // define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.ExceptionsGridPanel = Ext.extend(Ext.grid.GridPanel, {
    exceptionsTypeId: 'asset-not-found',

    initComponent: function () {
        this.addEvents(
            'gridrowclick'
        );

        var store = new Ext.data.Store({
            baseParams: {
                exceptionType: 'asset-not-found'
            },
            proxy:      new Ext.data.HttpProxy({
                url:        'php/get_asset_exceptions.php',
                mycallback: function () {
                }
            }),
            reader:     new Ext.data.JsonReader({
                root:          'assets',
                totalProperty: 'count'
            }, [
                {name: 'id', type: 'int'},
                {name: 'category', type: 'string'},
                {name: 'exception', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'location', type: 'string'},
                {name: 'cabinet', type: 'string'},
                {name: 'serialNumber', type: 'string'},
                {name: 'assetTag', type: 'string'},
                {name: 'manufacturer', type: 'string'},
                {name: 'model', type: 'string'},
                {name: 'elevation', type: 'string'},
                {name: 'numRUs', type: 'string'},
                {name: 'state', type: 'string'}
            ])
        });

        // set the default sort
        store.setDefaultSort('label', 'ASC');

        // define the column model for the grid
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                width:    100
            },
            columns:  [
                new Ext.grid.RowNumberer({width: 35}),
                {
                    header:    "Exception",
                    dataIndex: 'exception',
                    width:     140
                }, {
                /*
                    header:    "Name",
                    dataIndex: 'name',
                    width:     140
                }, {
                */
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
                    dataIndex: 'assetTag',
                    width: 80
                }, {
                /*
                    header:    "Manufacturer",
                    dataIndex: 'manufacturer'
                }, {
                */
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
                }
            ]
        });

        // apply config
        Ext.apply(this, {
            stripeRows:  true,
            columnWidth: .5,
            margins:     '0 0 0 0',
            loadMask:    {
                msg: "Loading exceptions..."
            },
            store:       store,
            cm:          colModel,
            viewConfig:  {
                forceFit:     true,
                scrollOffset: 0
            },
            listeners: {
                scope: this,
                rowclick: function(grid, rowIndex, e) {
                    var className = e.target.className,
                        assetId = grid.store.getAt(rowIndex).get('id');
                    // row was clicked, so fire the event that will load the asset into the asset details panel
                    this.fireEvent('gridrowclick', this, assetId, rowIndex);
                }
            }
        });
        // call parent
        ACDC.ExceptionsGridPanel.superclass.initComponent.apply(this, arguments);
    },

    exportGrid: function () {
        // create the form in HTML
        var html = "<span class='csv-message'>Generating Bill Gates' Excel file...</span>\n",
            win,
            task,
            items = this.store.data.items,
            jsonData = [];

        for (var i=0; i<items.length; i++) {
            jsonData.push(items[i].data);
        }

        html += "<form name='exportForm' id='exportForm' method='post' action='php/export_exceptions.php'>\n" +
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
    }
});