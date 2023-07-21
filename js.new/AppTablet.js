/*******************************************************************************
 *
 * $Id: AppTablet.js 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/AppTablet.js $
 *
 *******************************************************************************
 */

/**
 * Use Case: Search and select asset
 *      1. this.assetSelected()
 *          a. save the elevation
 *          b. save the cabinet id
 *          c. save the asset id
 *      2. this.assetDetails.showAsset(id, isBlade)
 *          a. get_asset_details.php
 *          b. load the asset properties into the panel
 *          c. fire 'assetloaded' (locationName, cabinetName)
 *      3. AppTablet::assetDetails::listener = assetloaded
 *          If different cabinet:
 *          a. this.getCabinetDetails(cabinetId)
 *              1. get_cabinet_details.php
 *              2. sort and assign cabinetData array
 *              3. set currentAssetIndex using currentElevation
 *              4. this.cabinetAssets.show(cabinetData)
 *                  a. create html table
 *                  b. define click event on each asset
 *              5. disableNavButtons() // enable & disable Above and Below buttons
 *              6. highlightAsset()
 *                  a. this.cabinetAssets.selectAsset(assetId)
 *          b. this.updateCabinetCombo(locationName, cabinetName)
 *              1. this.cabinetAssets.updateCabinetCombo(locationName, cabinetName)
 *                  a. if locationName != this.locationName
 *                  b. this.locationName = locationName
 *                  c. change cabinetCombo params
 *                  d. load combo
 *                  e. callback:
 *                      1. set value of combo
 *                      2. define array of cabinets
 *                      3. set cabinetIndex based on cabinetName
 *
 * Use Case: Asset clicked (in CabinetAssets)
 *      1. fire 'assetselected' (id, elevation, cabinet index)
 *      2. AppTablet::cabinetAssets::listener = assetselected
 *      3. this.loadAsset(asset id, elevation, cabinet index)
 *          a. set currentElevation
 *          b. set currentAssetIndex
 *          c. this.assetDetails.showAsset(asset id);
 *              1. get_asset_details.php
 *              2. load the asset properties into the panel
 *              3. fire 'assetloaded' (locationName, cabinetName)
 *      3. AppTablet::assetDetails::listener = assetloaded [Only If different cabinet]
 *          if (this.cabinetId != this.lastCabinetId)
 *          a. this.getCabinetDetails(cabinetId)
 *              1. get_cabinet_details.php
 *              2. sort and assign cabinetData array
 *              3. set currentAssetIndex using currentElevation
 *              4. this.cabinetAssets.show(cabinetData)
 *                  a. create html table
 *                  b. define click event on each asset
 *              5. disableNavButtons() // enable & disable Above and Below buttons
 *              6. highlightAsset()
 *                  a. this.cabinetAssets.selectAsset(assetId)
 *          b. this.updateCabinetCombo(locationName, cabinetName)
 *              1. this.cabinetAssets.updateCabinetCombo(locationName, cabinetName)
 *                  a. if locationName != this.locationName
 *                  b. this.locationName = locationName
 *                  c. change cabinetCombo params
 *                  d. load combo
 *                  e. callback:
 *                      1. set value of combo
 *                      2. define array of cabinets
 *                      3. set cabinetIndex based on cabinetName
 *
 * Use Case: Next Cabinet (in CabinetAssets)
 *      1. this.cabinetIndex++
 *      2. fire 'newcabinet' (cab id, name, locationName)
 *      3. AppTablet::newCabinet( cab id, name, locationName)
 *          a. this.getCabinetDetails(cabinetId)
 *          b. this.updateCabinetCombo(locationName, cabinetName)
 *
 * Use Case: cabinet selected from the drop down (in CabinetAssets)
 *      1. CabinetAssets::cabinetSelected(combo, record, index)
 *          a. unselectAsset(this.selectedAsset)
 *          b. selectedAsset = null
 *          c. fire 'cabinetSelected' (cabinet id, name, locationName)
 *      1. AppTablet::loadCabinet(cabinet id, name, locationName)
 *          a. currentElevation = null
 *          b. currentAssetIndex = null
 *          c. getCabinetDetails(cab id)
 *          d. updateCabinetCombo(locationName, name);
 */

// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.AppTablet = Ext.extend(Ext.Viewport, {
    initComponent: function ()
    {
        var screenWidth = 980,
            detailsWidth = 740,
            elevationWidth = screenWidth - detailsWidth;


        this.notify = new Ext.Notify({});

        // array of the assets in the current cabinet
        this.cabinetData = [];

        // keeps track of the index of the cabinetData
        this.currentAssetIndex = null;

        // keeps track of the current cabinet so that we don't reload the same cabinet or reload the cabinet combo when
        // we're just selecting a different asset in the same cabinet
        this.cabinetId = null;

        this.lastCabinetId = null;

        // keep track of selected asset id, elevation and index of cabinetDetails array
        this.currentElevation = null;
        this.selectedAssetId = null;

        var header = "<span class='title'>ACDC</span> <span class='tagLine'>- Now in tablet form -</span>";

        var footer = [
            "<div class='footer x-toolbar'>",
            "<a target='_blank' title='Go to the ACDC wiki page' href='" + ACDC.wikiURL + "'>ACDC " + this.release + " - " + this.env + "</a>",
            "<br>",
            "&copy; Copyright 2013 Neustar, Inc. All rights reserved. &nbsp; STS - Strategic Tools & Solutions &nbsp; ",
            "Web Programming -- <a href='mailto:Rob.Callahan@neustar.biz'>Rob Callahan, Principal Tool</a> &nbsp; ",
            "Powered by -- <a href='http://www.sencha.com/'>ExtJS</a> &amp; <a href='http://us2.php.net/'>PHP</a>",
            "</div>"].join("");


        this.assetsStore = new Ext.data.Store({
            proxy:      new Ext.data.HttpProxy({
                url:        'php/assets_search.php'
            }),
            reader:     new Ext.data.JsonReader({
                root:          'assets',
                totalProperty: 'total'
            }, [
                {name: 'id',           type: 'int'},
                {name: 'cabinetId',    type: 'int'},
                {name: 'elevation',    type: 'int'},
                {name: 'label',        type: 'string'},
                {name: 'displayValue', type: 'string'},
                {name: 'assetType',    type: 'string'},
                {name: 'match',        type: 'string'}
            ])
        });

        this.toolbar = new Ext.Toolbar({
            height: 42,
            items: [
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype:          'combo',
                    id:             'search',
                    name:           'search',
                    emptyText:      'Search label or serial num',
                    forceSelection: true,
                    triggerAction:  'all',
                    minChars:       3,
                    mode:           'remote',
                    hideTrigger:    true,
                    store:          this.assetsStore,
                    valueField:     'id',
                    displayField:   'displayValue',
                    width:          360,
                    listeners:      {
                        scope:  this,
                        select: this.assetSelected
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'button',
                    text: 'Asset Above',
                    id: 'asset-above',
                    iconCls: 'asset-up',
                    disabled: true,
                    listeners: {
                        scope: this,
                        click: this.assetAbove
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'button',
                    text: 'Asset Below',
                    id: 'asset-below',
                    iconCls: 'asset-down',
                    disabled: true,
                    listeners: {
                        scope: this,
                        click: this.assetBelow
                    }
                }
            ]
        });

        this.assetDetails = new ACDC.AssetDetails({
            notify: this.notify,
            actor:  this.actor,
            autoScroll: true,
            tablet: true,
            app: this,
            listeners: {
                scope: this,
                assetloaded: function(panel, locationName, cabinetName) {
                    if (this.cabinetId != this.lastCabinetId) {
                        this.getCabinetDetails(this.cabinetId);
                        this.updateCabinetCombo(locationName, cabinetName);
                        this.lastCabinetId = this.cabinetId;
                    }
                },
                installasset: function(panel) {
                    this.cabinetAssets.clearElevation();
                },
                addasset: function(panel) {
                    this.cabinetAssets.clearElevation();
                }
            }
        });

        this.cabinetAssets = new ACDC.CabinetAssets({
            notify: this.notify,
            actor:  this.actor,
            autoScroll: true,
            tablet: true,
            app: this,
            width: screenWidth - detailsWidth,
            listeners: {
                scope: this,
                assetselected: this.loadAsset,
                cabinetselected: this.loadCabinet,
                newcabinet: this.newCabinet
            }
        });

        Ext.apply(this, {
            renderTo: document.body,
            layout:   'border',
            items:    [
                {
                    boxMaxWidth:  screenWidth,
                    region:       'north',
                    margins:      '0 0 0 0',
                    height:       36,
                    html:         header,
                    bodyCssClass: 'header'
                },
                {
                    boxMaxWidth:  detailsWidth,
                    region:     'center',
                    id:         'center-panel',
                    autoHeight: true,
                    margins: '0 0 0 0',
                    tbar: this.toolbar,
                    items: [
                        this.assetDetails
                    ]
                },
                {
                    boxMaxWidth: elevationWidth,
                    region: 'west',
                    id: 'west-panel',
                    autoHeight: true,
                    //margins:    '76 0 0 0',
                    margins:    '0 0 0 0',
                    items: [
                        this.cabinetAssets
                    ]
                }
                /*
                {
                    boxMaxWidth:  screenWidth,
                    region:  'south',
                    xtype:   'panel',
                    layout:  'fit',
                    border:  false,
                    frame:   false,
                    cls:     'footer',
                    margins: '0 0 0 0',
                    height:  30,
                    html:    footer
                }
                */
            ]
        });

        ACDC.AppTablet.superclass.initComponent.apply(this, arguments);
    },

    afterRender: function ()
    {
        ACDC.AppTablet.superclass.afterRender.apply(this, arguments);
    },

    clearSearchField: function()
    {
        var cmp = Ext.getCmp('search');
        if (cmp) {
            cmp.setValue('');
        }
    },

    updateCabinetCombo: function(locationName, cabinetName)
    {
        this.cabinetAssets.updateCabinetCombo(locationName, cabinetName);
    },

    /**
     * Called when the Asset Above button is clicked
     * @param button
     * @param e
     */
    assetAbove: function(button, e)
    {
        if (ACDC.debug) ACDC.ConsoleLog('assetBelow()');

        // decrement the asset index that points to the current index in cabinetData array
        this.currentAssetIndex--;
        this.selectedAssetId = this.cabinetData[this.currentAssetIndex].id;

        // call showAsset which gets the asset details from the server and populates the properties grid
        // when load is complete it fires the event 'assetloaded'
        this.assetDetails.showAsset(this.selectedAssetId, 0);

        // enable and disable the above and below buttons
        this.disableNavButtons();

        // highlight the asset in the elevation panel
        this.highlightAsset();
    },

    /**
     * Called when the Asset Below button is clicked
     * @param button
     * @param e
     */
    assetBelow: function(button, e)
    {
        if (ACDC.debug) ACDC.ConsoleLog('assetBelow()');

        // increment the asset index that points to the current index in cabinetData array
        this.currentAssetIndex++;
        this.selectedAssetId = this.cabinetData[this.currentAssetIndex].id;

        // call showAsset which gets the asset details from the server and populates the properties grid
        // when load is complete it fires the event 'assetloaded'
        this.assetDetails.showAsset(this.selectedAssetId, 0);

        // enable and disable the above and below buttons
        this.disableNavButtons();

        // highlight the asset in the elevation panel
        this.highlightAsset();
    },

    /**
     * Called when an asset (label) is searched and selected in the search box a the top
     * @param combo
     * @param record
     */
    assetSelected: function(combo, record)
    {
        var json = record.json;

        if (ACDC.debug) ACDC.ConsoleLog('assetSelected(id=' + json.id + ',elevation=' + json.elevation + ',cabinetId=' + json.cabinetId + ')');

        this.selectedAssetId = json.id;

        // save the current elevation which is used in getCabinetDetails to determine the index of cabinetDetails array
        this.currentElevation = json.elevation;

        // update cabinet ids
        this.lastCabinetId = this.cabinetId;
        this.cabinetId = json.cabinetId;

        // call showAsset which gets the asset details from the server and populates the properties grid
        // when load is complete it fires the event 'assetloaded'
        this.assetDetails.showAsset(this.selectedAssetId, json.isBlade);
    },

    loadAsset: function(panel, assetId, elevation, index)
    {
        this.selectedAssetId = assetId;
        this.currentElevation = elevation;
        this.currentAssetIndex = index;
        this.assetDetails.showAsset(assetId, 0);
        this.disableNavButtons();
        this.highlightAsset();
    },

    disableNavButtons: function()
    {
        if (ACDC.debug) ACDC.ConsoleLog('disableNavButtons()');

        // enable above and below buttons
        Ext.getCmp('asset-above').enable();
        Ext.getCmp('asset-below').enable();

        // no more assets above
        if (this.currentAssetIndex === 0) {
            Ext.getCmp('asset-above').disable();
        }

        // no more assets below
        if (this.currentAssetIndex === this.cabinetData.length - 1) {
            Ext.getCmp('asset-below').disable();
        }
    },

    highlightAsset: function()
    {
        if (ACDC.debug) ACDC.ConsoleLog('highlightAsset(' + this.selectedAssetId + ')');
        this.cabinetAssets.selectAsset(this.selectedAssetId);
    },

    newCabinet: function(panel, id, name, locationName)
    {
        this.currentElevation = null;
        this.currentAssetIndex = null;
        this.selectedAssetId = null;

        this.clearSearchField();
        this.assetDetails.clearData();

        this.getCabinetDetails(id);
        this.updateCabinetCombo(locationName, name);
    },

    loadCabinet: function(cabinetAssetsPanel, cabinetId, name, locationName)
    {
        if (ACDC.debug) ACDC.ConsoleLog('loadCabinet(' + cabinetId + ',' + name + ',' + locationName + ')');
        this.currentElevation = null;
        this.currentAssetIndex = null;
        this.getCabinetDetails(cabinetId);
        this.updateCabinetCombo(locationName, name);
    },

    getCabinetDetails: function(cabinetId)
    {
        if (ACDC.debug) ACDC.ConsoleLog('getCabinetDetails(' + cabinetId + ')');

        Ext.Ajax.request({
           url:        'php/get_cabinet_details.php',
           params:     {
               cabinetId: cabinetId
           },
           scope:      this,
           mycallback: function (json, options) {
               if (ACDC.debug) ACDC.ConsoleLog('getCabinetDetails():AjaxCallback this.currentElevation=' + this.currentElevation);
               var i, d, ar = [];

               this.cabinetId = json.cabinetId;

               json.data.sort(
                   function(a, b) {
                       return b.elevation - a.elevation
               });
               this.cabinetData =[];
               for (i=0; i<json.data.length; i++) {
                   d = json.data[i];
                   if (ACDC.debug) ACDC.ConsoleLog('getCabinetDetails() i=' + i + ',elevation=' + d.elevation);
                   this.cabinetData.push(d);
                   if (d.elevation == this.currentElevation) {
                       if (ACDC.debug) ACDC.ConsoleLog('getCabinetDetails() assigning currentAssetIndex=' + i);
                       this.currentAssetIndex = i;
                   }
               }
               if (this.currentAssetIndex == null) {
                   this.currentAssetIndex = 0;

                   if (this.cabinetData.length > 0) {
                       this.currentElevation = this.cabinetData[0].elevation;
                       this.selectedAssetId = this.cabinetData[0].id;

                       this.assetDetails.showAsset(this.selectedAssetId, 0);
                   }
               }

               this.cabinetAssets.show(this.cabinetData);
               this.disableNavButtons();
               this.highlightAsset();
           }
       });
    }

    /*
    getAssetDetails: function(assetId, isBlade)
    {
        Ext.Ajax.request({
            url:        'php/get_asset_details.php',
            params:     {
                assetId: assetId,
                isBlade: isBlade
            },
            scope:      this,
            mycallback: function () {
                this.assetDetails.showAsset(assetId, isBlade);
                this.doLayout(false, true);
            }
        });
    }
    */
});


