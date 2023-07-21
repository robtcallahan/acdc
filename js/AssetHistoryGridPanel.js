/*******************************************************************************
 * $Id: AssetHistoryGridPanel.js 80568 2013-10-30 20:28:34Z rcallaha $
 * $Date: 2013-10-30 16:28:34 -0400 (Wed, 30 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80568 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/AssetHistoryGridPanel.js $
 *
 *******************************************************************************
 */

    // define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.AssetHistoryGridPanel = Ext.extend(Ext.grid.GridPanel, {
    initComponent: function () {
        var store = new Ext.data.Store(
            {
                autoLoad: false,
                proxy:  new Ext.data.HttpProxy(
                    {
                        url:        'php/get_asset_history.php',
                        mycallback: function () {
                        }
                    }),
                reader: new Ext.data.JsonReader(
                    {
                        root:          'history',
                        totalProperty: 'count'
                    }, [
                        {name: 'id',           type: 'int'},
                        {name: 'assetId',      type: 'int'},
                        {name: 'timeStamp',    type: 'date', dateFormat: 'Y-m-d H:i:s'},
                        {name: 'userName',     type: 'string'},
                        {name: 'propertyName', type: 'string'},
                        {name: 'oldValue',     type: 'string'},
                        {name: 'newValue',     type: 'string'}
                    ])
            }); // eo store object

        // set the default sort
        store.setDefaultSort('timeStamp', 'DESC');

        // define the column model for the grid
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                width:    150
            },
            columns:  [
                new Ext.grid.RowNumberer({width: 25}),
                {
                    header:    "Date Time",
                    dataIndex: 'timeStamp',
                    width: 120,
                    renderer:  Ext.util.Format.dateRenderer("Y-m-d H:i")
                }, {
                    header:    "Property Name",
                    dataIndex: 'propertyName'
                }, {
                    header:    "Previous Value",
                    dataIndex: 'oldValue'
                }, {
                    header:    "Current Value",
                    dataIndex: 'newValue'
                }, {
                    header:    "User Name",
                    dataIndex: 'userName',
                    width:     100
                }
            ]
        });

        // apply config
        Ext.apply(this, {
            stripeRows:  true,
            columnWidth: .5,
            autoHeight:  true,
            margins:     '0 0 0 0',
            loadMask:    {
                msg: "Loading asset history..."
            },
            store:       store,
            cm:          colModel,
            viewConfig:  {
                forceFit:     true,
                scrollOffset: 0
            }
        });
        // call parent
        ACDC.AssetHistoryGridPanel.superclass.initComponent.apply(this, arguments);
    }
});