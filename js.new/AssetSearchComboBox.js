/*******************************************************************************
 *
 * $Id: AssetSearchComboBox.js 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/AssetSearchComboBox.js $
 *
 *******************************************************************************
 */

    // define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.AssetSearchComboBox = Ext.extend(Ext.form.ComboBox, {

    forceSelection: true,

    initComponent: function ()
    {
        Ext.apply(this, arguments);

        this.addEvents(
            'locationchange'
        );

        this.store = new Ext.data.Store({
            baseParams: {
            },
            proxy:      new Ext.data.HttpProxy(
                {
                    url:        'php/lookup_asset.php',
                    mycallback: function ()
                    {
                    }
                }),
            reader:     new Ext.data.JsonReader(
                {
                    root:          'items',
                    totalProperty: 'total'
                }, [
                    {name: 'id', type: 'string'},
                    {name: 'sysId', type: 'string'},
                    {name: 'name', type: 'string'},
                    {name: 'cmdbLink', type: 'string'},
                    {name: 'sysClassName', type: 'string'},
                    {name: 'assetClass', type: 'string'},
                    {name: 'source', type: 'string'},

                    {name: 'location', type: 'string'},
                    {name: 'cabinet', type: 'string'},
                    {name: 'elevation', type: 'string'},
                    {name: 'numRUs', type: 'string'},

                    {name: 'serialNumber', type: 'string'},
                    {name: 'assetTag', type: 'string'},

                    {name: 'deviceType', type: 'string'},
                    {name: 'manufacturer', type: 'string'},
                    {name: 'model', type: 'string'},

                    {name: 'state', type: 'string'},
                    {name: 'powerStatus', type: 'string'},

                    {name: 'businessService', type: 'string'},
                    {name: 'subsystem', type: 'string'},
                    {name: 'owningSuppMgr', type: 'string'},
                    {name: 'opsSuppGroup', type: 'string'},

                    {name: 'memGB', type: 'string'},
                    {name: 'cpuManufacturer', type: 'string'},
                    {name: 'cpuDescr', type: 'string'},
                    {name: 'cpuSpeed', type: 'string'},
                    {name: 'cpuCount', type: 'string'},
                    {name: 'cpuCoreCount', type: 'string'},
                    {name: 'os', type: 'string'},
                    {name: 'osVersion', type: 'string'},
                    {name: 'osPatchLevel', type: 'string'},
                    {name: 'installStatus', type: 'string'},
                    {name: 'environment', type: 'string'}
                ])
        });

        Ext.apply(this, {
            mode:           'remote',
            typeAhead:      true,
            selectOnFocus:  true,
            allowBlank:     false,
            triggerAction:  'all',
            lazyRender:     true,
            minChars:       3,
            queryDelay:     1500,
            store:          this.store,
            displayField:   'name',
            tpl: '<tpl for="."><div ext:qtip="BS: {businessService}<br>SS: {subsystem}<br>SN: {serialNumber}<br>ATag: {assetTag}" ext:qwidth=380 class="x-combo-list-item">{name}</div></tpl>'
        });

        ACDC.EditorComboBox.superclass.initComponent.apply(this, arguments);
    }
});

