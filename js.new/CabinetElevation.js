/*******************************************************************************
 *
 * $Id: CabinetElevation.js 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/CabinetElevation.js $
 *
 *******************************************************************************
 */

    // define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.CabinetElevation = Ext.extend(Ext.Panel, {
    // for esting purposes
    gotoAsset: null, // 16,

    numRUs: 44,
    cabinet: null,

    initComponent: function ()
    {
        this.addEvents(
            'showcabinetdetails'
        );

        this.topToolbar = new Ext.Toolbar({
            items: [
                {
                    xtype:    'button',
                    id:       'cabinet-list-button',
                    text:     'List View',
                    tooltip:  'Show list of assets in this cabinet',
                    disabled: false,
                    scope:    this,
                    handler:  this.cabinetDetails
                },
                {
                    xtype:    'button',
                    id:       'cabinet-close-button',
                    text:     'Close',
                    tooltip:  'Close this panel',
                    disabled: false,
                    scope:    this,
                    handler:  this.closePanel
                }
            ]
        });

       // apply config
        Ext.apply(this, {
            frame:  false,
            border: false,

            tbar: this.topToolbar,
            margins:    '0 0 0 0',
            loadMask:   {
                msg: "Loading cabinet..."
            }
            //bodyStyle: 'height: 100%'
        });

        ACDC.CabinetElevation.superclass.initComponent.apply(this, arguments);
    },

    afterRender: function ()
    {
        ACDC.CabinetElevation.superclass.afterRender.apply(this, arguments);
        this.loadMask = new Ext.LoadMask(this.bwrap, {});
    },

    closePanel: function(button, e) {
        Ext.getCmp('east-panel').collapse();
    },

    findAssetByElevation: function (assets, elevation)
    {
        for (var i = 0; i < assets.length; i++) {
            if (parseInt(assets[i].elevation) === elevation) {
                return assets[i];
            }
        }
        return null;
    },

    cabinetDetails: function()
    {
        this.fireEvent('showcabinetdetails', this, this.cabinet);
    },

    findAssetImage: function(asset)
    {
        var image,
            re,
            assetImages = this.assetImages;

        for (var i = 0; i < assetImages.length; i++) {
            image = assetImages[i];
            re = new RegExp(image.man + ".*" + image.model);
            if (asset.model.search(re) !== -1) {
                return image;
            }
        }
        return null;
    },

    getCabinetElevation: function(cabinet, assetId)
    {
        this.loadMask.show("Loading elevation...");
        Ext.Ajax.request({
           url:        'php/get_cabinet_details.php',
           params:     {
               cabinetId: cabinet.id
           },
           scope:      this,
           mycallback: function (json, options) {
               this.loadMask.hide();
               this.show(cabinet, json.data, json.exceptions, assetId);
           },
            myerrorcallback: function(json, options) {
                this.loadMask.hide();
            }
       });
    },

    show: function (cabinet, assets, exceptions, assetId)
    {
        this.cabinet = {
            id: cabinet.id,
            name: cabinet.name,
            assets: assets
        };

        var assetImages = this.assetImages,
            a,
            ru,
            blade,
            tdAssets = [],
            imageFound,
            image,
            re,
            length,
            html = "";

        // if only 1 asset with a height of 44 RUs, it must be a storage array such as an EMC VMAX
        if (assets.length === 1 && assets[0].numRUs === 44) {
            a = assets[0];
            html += "<div id='cab-title' class='cab-array-title'>" + cabinet.name;
            if (a.sysId === null) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
            html += "</div>";

            image = this.findAssetImage(a);
            if (image) {
                html += [
                    "<div class='cab-asset-full-rack' id=asset-id-", a.id,
                    "     style='background-image:url(", this.imagesDir, "/", image.image, ");' ",
                    "     onclick=app.assetDetails.showAsset(" + a.id + ");>"
                ].join("");
                html += "    <div class='cab-array-label'><div class='cab-ru-name'>" + a.label ;
                if (a.sysId === null || a.elevation === 0 || a.numRUs === 0) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
                html += "</div></div>";
            }
            else {
                html += "</div>";

                html += [
                    "  <table class='cab-table' cellpadding=0 cellspacing=0>",
                    "    <tr>",
                    "      <td class='cab-td-top'></td>",
                    "    </tr>",
                    "    <tr>",
                    "      <td class='cab-td-middle'>",
                    "        <div class='cab-div-main'>",
                    "          <table class='cab-table-main' cellpadding=0 cellspacing=0>"
                ].join("");

                for (ru = this.numRUs; ru > 0; ru--) {
                    html += "<tr class='cab-tr'>";
                    html += "  <td class='cab-ru-filled' id=asset-id-" + a.id + " style='cursor:pointer; border-top: 1px solid black;' onclick=app.assetDetails.showAsset(" + a.id + ");>";
                    html += "    <div class='cab-ru-label'><div class='cab-ru-name'>" + a.label ;
                    if (a.sysId === null || a.elevation === 0 || a.numRUs === 0) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
                    html += "</div></div>";
                    html += "  </td>";
                    html += "  <td class='cab-ru-number'>" + ru + "</td>";
                    html += "</tr>";

                    tdAssets.push(a);

                    if (a.numRUs > 1) {
                        for (var large = 1; large < a.numRUs - 1; large++) {
                            ru--;
                            html += "<tr class='cab-tr'>";
                            html += "  <td class='cab-ru-filled'></td>";
                            html += "  <td class='cab-ru-number'>" + ru + "</td>";
                            html += "</tr>";
                        }
                        ru--;
                        html += "<tr class='cab-tr'>";
                        html += "  <td class='cab-ru-filled' style='border-bottom: 1px solid black;'>&nbsp;</td>";
                        html += "  <td class='cab-ru-number'>" + ru + "</td>";
                        html += "</tr>";
                    }
                }
                html += "</table></div></td></tr>";
                html += "<tr>";
                html += "<td class='cab-td-bottom'></td>",
                html += "</tr></table>";
                html += "</div>";
            }

            this.update(html);
            this.addQuickTipAsset(a);
            return;
        }

        html = "<div>";
        html += "<div id='cab-title' class='cab-title'>" + cabinet.name;
        if (exceptions) {
            html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
        }
        html += "</div>";

        html += [
            "  <table class='cab-table' cellpadding=0 cellspacing=0>",
            "    <tr>",
            "      <td class='cab-td-top'></td>",
            "    </tr>",
            "    <tr>",
            "      <td class='cab-td-middle'>",
            "        <div class='cab-div-main'>",
            "          <table class='cab-table-main' cellpadding=0 cellspacing=0>"
        ].join("");


        for (ru = this.numRUs; ru > 0; ru--) {
            a = this.findAssetByElevation(assets, ru);
            if (a) {
                //console.log("ru=" + ru + ", name=" + a.name + ", model=" + a.model);

                if (a.blades.length > 0) {
                    //console.log('chassis=' + a.name);
                    html += "<tr class='cab-tr'>";
                    html += "  <td rowspan='10' valign='top'>";
                    html += "    <div class='cab-hp-chassis'>";
                    html += "      <table cellspacing='0' cellpadding='0' class='cab-hp-chassis-table'>";
                    html += "        <tr>";
                    for (i = 1; i <= 8; i++) {
                        blade = a.blades[i];
                        //console.log("i=" + i + ", slot=" + blade.slot + ", type=" + blade.type + ", deviceName=" + blade.deviceName + ", fullHeight=" + blade.fullHeight);

                        if (blade.fullHeight) {
                            if (blade.type === "active" || blade.type === "spare") {
                                html += "<td rowspan=2 class='cab-hp-blade-full-height-active' id='asset-id-" + blade.dbId +
                                    "' style='cursor:pointer;' onclick=app.assetDetails.showAsset(" + blade.dbId + ",1);></td>";
                                tdAssets.push(blade);
                            }
                        }
                        else {
                            if (blade.type === "empty") {
                                html += "<td class='cab-hp-blade-half-height-empty'></td>";
                            }
                            else {
                                html += "<td class='cab-hp-blade-half-height-active' id='asset-id-" + blade.dbId +
                                    "' style='cursor:pointer;' onclick=app.assetDetails.showAsset(" + blade.dbId + ",1);></td>";
                                tdAssets.push(blade);
                            }
                        }
                    }
                    html += "</tr>";
                    html += "<tr>";
                    for (var i = 9; i <= 16; i++) {
                        blade = a.blades[i];
                        if (typeof blade != "undefined") {
                            //console.log("i=" + i + ", slot=" + blade.slot + ", type=" + blade.type + ", deviceName=" + blade.deviceName + ", fullHeight=" + blade.fullHeight + ", upper=" + a.blades[i-8].fullHeight);

                            if (!a.blades[i - 8].fullHeight) {
                                if (blade.type === "empty") {
                                    html += "<td class='cab-hp-blade-half-height-empty'></td>";
                                }
                                else {
                                    html += "<td class='cab-hp-blade-half-height-active' id='asset-id-" + blade.dbId +
                                        "' style='cursor:pointer;' onclick=app.assetDetails.showAsset(" + blade.dbId + ",1);></td>";
                                    tdAssets.push(blade);
                                }
                            }
                        }
                    }
                    html += "        </tr>";
                    html += "      </table>";
                    html += "    <div class='cab-hp-chassis-label' id='asset-id-" + a.id + "' style='cursor:pointer;' onclick=app.assetDetails.showAsset(" + a.id + ");>";

                    html += "<div class='cab-hp-chassis-name'>" + a.label ;
                    if (a.sysId === null || a.elevation === 0 || a.numRUs === 0) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
                    html += "</div></div>";

                    html += "    </div>";
                    html += "  </td>";
                    html += "  <td class='cab-ru-number'>" + ru + "</td>";
                    html += "</tr>";

                    for (i = 0; i < 9; i++) {
                        ru--;
                        html += "<tr class='cab-tr'>";
                        html += "  <td class='cab-ru-number'>" + ru + "</td>";
                        html += "</tr>";
                    }
                    tdAssets.push(a);
                }

                else {
                    imageFound = 0;
                    for (i = 0; i < assetImages.length; i++) {
                        image = assetImages[i];
                        re = new RegExp(image.man + ".*" + image.model);
                        if (a.model.search(re) !== -1) {
                            imageFound = 1;
                            length = image.rus * 17;
                            html += "<tr class='cab-tr'>";
                            html += "  <td rowspan='" + image.rus + "' valign='top'>";
                            html += "    <div class='cab-asset' id=asset-id-" + a.id +
                                "             style='background-image:url(" + this.imagesDir + "/" + image.image + ");background-size:236px " + length + "px;width:236px;height:" + length + ";cursor:pointer;' " +
                                "             onclick=app.assetDetails.showAsset(" + a.id + ");>";

                            html += "    <div class='cab-ru-label'><div class='cab-ru-name'>" + a.label ;
                            if (a.sysId === null || a.elevation === 0 || a.numRUs === 0) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
                            html += "</div></div>";

                            html += "  </td>";
                            html += "  <td class='cab-ru-number'>" + ru + "</td>";
                            html += "</tr>";

                            for (var j = 1; j < image.rus; j++) {
                                ru--;
                                html += "<tr class='cab-tr'>";
                                html += "  <td class='cab-ru-number'>" + ru + "</td>";
                                html += "</tr>";
                            }
                            tdAssets.push(a);

                        }
                    }
                    if (!imageFound) {
                        html += "<tr class='cab-tr'>";
                        html += "  <td class='cab-ru-filled' id=asset-id-" + a.id + " style='cursor:pointer; border-top: 1px solid black;' onclick=app.assetDetails.showAsset(" + a.id + ");>";
                        html += "    <div class='cab-ru-label'><div class='cab-ru-name'>" + a.label ;
                        if (a.sysId === null || a.elevation === 0 || a.numRUs === 0) html += "<span class='cab-ru-name-exception'>&nbsp;[E]</span>";
                        html += "</div></div>";
                        html += "  </td>";
                        html += "  <td class='cab-ru-number'>" + ru + "</td>";
                        html += "</tr>";

                        tdAssets.push(a);

                        if (a.numRUs > 1) {
                            for (var large = 1; large < a.numRUs - 1; large++) {
                                ru--;
                                html += "<tr class='cab-tr'>";
                                html += "  <td class='cab-ru-filled'></td>";
                                html += "  <td class='cab-ru-number'>" + ru + "</td>";
                                html += "</tr>";
                            }
                            ru--;
                            html += "<tr class='cab-tr'>";
                            html += "  <td class='cab-ru-filled' style='border-bottom: 1px solid black;'>&nbsp;</td>";
                            html += "  <td class='cab-ru-number'>" + ru + "</td>";
                            html += "</tr>";
                        }
                    }
                }
            }
            else {
                html += "<tr class='cab-tr'>";
                html += "  <td class='cab-ru-empty'>&nbsp;</td>";
                html += "  <td class='cab-ru-number'>" + ru + "</td>";
                html += "</tr>";
            }
        }
        html += "</table></div></td></tr>";
        html += "<tr>";
        html += "<td class='cab-td-bottom'></td>",
        html += "</tr></table>";
        html += "</div>";

        this.update(html);

        for (var i = 0; i < tdAssets.length; i++) {
            a = tdAssets[i];
            if (a.dbId) {
                this.addQuickTipBlade(a);
            }
            else {
                this.addQuickTipAsset(a);
            }
        }

        if (assetId) {
            var el = Ext.get('asset-id-' + assetId);
            if (el) {
                var w = el.getWidth();
                var h = el.getHeight();
                el.frame("ffff00", 3, {
                    duration: 1.5
                });
            }
        }

        // for testing purposes
        if (this.gotoAsset) {
            this.app.assetDetails.showAsset.defer(500, this.app.assetDetails, [this.gotoAsset]);
        }
    },

    clearDetails: function()
    {
        this.update('');
    },

    addQuickTipAsset: function (a)
    {
        var e = Ext.get('asset-id-' + a.id);
        html = [
            "Name: " + a.name + "<br>",
            "Label: " + a.label + "<br>",
            "Man: " + a.manufacturer + "<br>",
            "Model: " + a.model + "<br>",
            "SN: " + a.serialNumber + "<br>",
            "Asset: " + a.assetTag + "<br>"
        ].join("");

        this.registerQuickTip(e, html);
    },

    addQuickTipBlade: function (b)
    {
        var e = Ext.get('asset-id-' + b.dbId);
        html = [
            "Name: " + (b.fqdn ? b.fqdn : b.deviceName) + "<br>",
            "Man: HP<br>",
            "Model: " + b.productName + "<br>",
            "SN: " + b.serialNumber + "<br>"
        ].join("");

        this.registerQuickTip(e, html);
    },

    registerQuickTip: function (e, html)
    {
        Ext.QuickTips.register({
            target: e,
            text:   html
        });
    }
});


