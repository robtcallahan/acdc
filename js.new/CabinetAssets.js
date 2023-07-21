/*******************************************************************************
 *
 * $Id: CabinetAssets.js 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/CabinetAssets.js $
 *
 *******************************************************************************
 */


// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.CabinetAssets = Ext.extend(Ext.Panel, {

    cabinets: [],
    cabinetData: [],
    cabinetIndex: null,
    selectedAssetId: null,
    locationName: null,

    initComponent: function ()
    {
        this.addEvents(
            'assetselected',
            'cabinetselected',
            'newcabinet'
        );

        this.cabinetCombo = new ACDC.EditorComboBox({
            id: 'cabinet-combo',
            itemName: 'cabinet',
            width: 230,
            listeners: {
                scope: this,
                select: this.cabinetSelected
            }
        });

        /*
        this.topToolbar = new Ext.Toolbar({
            items: [
                this.cabinetCombo
            ]
        });
        */

        var cabinetHtml = [
            '<div id="div-cabinet">',
            '<table id="cab-table" class="cab-table" cellpadding=0 cellspacing=0>'
        ].join("");

        for (var ru = 44; ru > 0; ru--) {
            cabinetHtml += '<tr><td class="cab-assets-cell">' + ru + '</td><td class="cab-assets-cell">&nbsp;</td></tr>';
        }
        cabinetHtml += "</table>";

       // apply config
        Ext.apply(this, {
            frame:  false,
            border: false,
            autoScroll: false,
            bodyStyle: 'height: 100%',
            tbar: new Ext.Toolbar({
                height: 42,
                items: [
                {
                    xtype: 'button',
                    text: 'Prev Cab',
                    id: 'previous-cabinet',
                    iconCls: 'cabinet-prev',
                    disabled: false,
                    listeners: {
                        scope: this,
                        click: this.previousCabinet
                    }
                },
                {
                    xtype: 'button',
                    text: 'Next Cab',
                    id: 'next-cabinet',
                    iconCls: 'cabinet-next',
                    disabled: false,
                    listeners: {
                        scope: this,
                        click: this.nextCabinet
                    }
                }]
            }),
            items: [
                this.cabinetCombo,
            {
                html: cabinetHtml
            }
            ]
        });

        ACDC.CabinetAssets.superclass.initComponent.apply(this, arguments);
    },

    /*
    afterRender: function()
    {
        ACDC.CabinetAssets.superclass.afterRender.apply(this, arguments);

        var html = [
            '<div id="div-prev-cab"></div>',
            "<div>",
            "  <table class='cab-table' cellpadding=0 cellspacing=0>"
        ].join("");

        for (var ru = 44; ru > 0; ru--) {
            html += '<tr><td class="cab-assets-cell">' + ru + '</td><td class="cab-assets-cell">&nbsp;</td></tr>';
        }
        html += "</table>";

        this.box = new Ext.BoxComponent({

        });
        this.update(html, false, function() {
            var header = new Ext.menu.Menu({
                items: [
                {
                    xtype: 'button',
                    text: 'Previous Cabinet',
                    id: 'previous-cabinet',
                    iconCls: 'asset-up',
                    disabled: true,
                    listeners: {
                        scope: this,
                        click: this.previousCabinet
                    }
                }]
            });

            Ext.get('div-prev-cab').insertFirst(header);
        }.createDelegate(this));
    },
    */

    previousCabinet: function()
    {
        this.cabinetIndex--;
        this.selectedAssetId = null;
        var cab = this.cabinets[this.cabinetIndex];
        this.fireEvent('newcabinet', this, cab.id, cab.name, this.locationName);
    },

    nextCabinet: function()
    {
        this.cabinetIndex++;
        this.selectedAssetId = null;
        var cab = this.cabinets[this.cabinetIndex];
        this.fireEvent('newcabinet', this, cab.id, cab.name, this.locationName);
    },

    selectAsset: function(assetId)
    {
        var el = Ext.get('asset-id-' + assetId);

        if (ACDC.debug) ACDC.ConsoleLog('selectAsset(' + assetId + ')');

        if (this.selectedAssetId) {
            this.unselectAsset(this.selectedAssetId);
        }

        if (el) {
            el.addClass('asset-selected');
        }
        this.selectedAssetId = assetId;
    },

    unselectAsset: function(assetId)
    {
        if (assetId && Ext.get('asset-id-' + assetId)) {
            Ext.get('asset-id-' + assetId).removeClass('asset-selected');
        }
    },

    clearElevation: function()
    {
        var table = Ext.get('cab-table'),
            combo = Ext.getCmp('cabinet-combo');

        if (table) table.remove();
        if (combo) combo.setValue('');
    },

    show: function(cabinetData)
    {
        if (ACDC.debug) ACDC.ConsoleLog('show(cabinetData.length=' + cabinetData.length + ')');
        var el = 0,
            asset,
            html ='<table id="cab-table" class="cab-table" cellpadding=0 cellspacing=0>';

        // remove all listeners from the cabinet asset elements
        for (var i=0; i<this.cabinetData.length; i++) {
            el = Ext.get('asset-id-' + this.cabinetData[i].id);
            if (el) {
                el.un("click", function(e, el, config) {
                    this.fireEvent('assetselected', this, config.id, config.elevation, config.index);
                }, this);
            }
        }

        // destroy existing table element if exists
        if (Ext.get('cab-table')) {
            Ext.get('cab-table').remove();
        }

        // save the new cabinet data
        this.cabinetData = cabinetData;

        // assign the first asset
        i = 0;
        asset = cabinetData[i];

        for (var ru = 44; ru > 0; ru--) {
            if (ACDC.debug) {
                ACDC.ConsoleLog('show() ru=' + ru + ',i=' + i);
                if (asset) {
                    ACDC.ConsoleLog('show() asset id=' + asset.id + ',label=' + asset.label + ',elevation=' + asset.elevation);
                }
            }

            html += '<tr><td class="cab-assets-cell">' + ru + "</td>";
            if (asset && asset.elevation === ru) {
                html += '<td class="cab-assets-cell cab-assets-pointer" id="asset-id-' + asset.id + '">&nbsp;' + asset.label + '</td></tr>';
                for (var h=1; h<asset.numRUs; h++) {
                    ru--;
                    html += '<tr><td class="cab-assets-cell-no-border">' + ru + '</td><td class="cab-assets-cell-no-border">&nbsp;</td></tr>';
                }
                i++;
                if (i >= cabinetData.length) {
                    asset = null;
                } else {
                    asset = cabinetData[i];
                }
            } else {
                html += '<td class="cab-assets-cell">&nbsp;</td></tr>';
            }
        }
        html += "</table>";
        Ext.get('div-cabinet').update(html, false, function() {
            var el, i;
            for (i=0; i<cabinetData.length; i++) {
                el = Ext.get('asset-id-' + cabinetData[i].id);
                if (el) {
                    el.on("click", function(e, el, config) {
                        this.fireEvent('assetselected', this, config.id, config.elevation, config.index);
                    }, this, {id: cabinetData[i].id, elevation: cabinetData[i].elevation, index: i});
                }
            }
        }.createDelegate(this));
    },

    cabinetSelected: function(combo, record, index)
    {
        if (ACDC.debug) ACDC.ConsoleLog('cabinetSelected(' + record.get('id') + ',' + record.get('name') + ',' + this.locationName + ')');
        if (this.selectedAssetId) {
            this.unselectAsset(this.selectedAssetId);
        }
        this.selectedAssetId = null;
        this.cabinetIndex = index;
        this.fireEvent('cabinetselected', this, record.get('id'), record.get('name'), this.locationName);
    },

    updateCabinetCombo: function (locationName, cabinetName) {
        if (locationName !== this.locationName) {
            this.locationName = locationName;
            // add the location name to the cabinetCombo so that it's passed when the combo is activated
            this.cabinetCombo.store.baseParams['locationName'] = locationName;
            this.cabinetCombo.store.baseParams['query'] = "";
            // set the cabinet store to destroyed so that we force it to reload if the location changed
            this.cabinetCombo.store.load({
                scope: this,
                callback: function() {
                    Ext.getCmp('cabinet-combo').setValue(cabinetName);
                    var cabItems = this.cabinetCombo.getStore().data.items;
                    this.cabinets = [];
                    for (var i=0; i<cabItems.length; i++) {
                        this.cabinets.push({id: cabItems[i].json.id, name: cabItems[i].json.name})
                        if (cabItems[i].json.name === cabinetName) {
                            this.cabinetIndex = i;
                        }
                    }
                }
            });
        } else {
            Ext.getCmp('cabinet-combo').setValue(cabinetName);
        }
    }
});


