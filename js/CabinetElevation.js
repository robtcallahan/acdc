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

    /** @namespace res.id */
    /** @namespace res.projectName */
    /** @namespace res.numRUs */
    /** @namespace res.ruNumbers */
    /** @namespace res.elevation */
    /** @namespace res.model */
    /** @namespace res.assetName */
    /** @namespace res.serialNumber */
    /** @namespace res.assetTag */
    /** @namespace res.estimatedInstallDate */

    /** @namespace ruResHash.id */

    initComponent: function () {
        this.addEvents(
            'showcabinetdetails'
        );

        this.ruHash = {};
        this.ruResHash = {};
        this.cabinet = {};
        this.lastSelected = 0;
        this.selectedRUs = {};

        this.editableByUser = this.actor.accessCode === 1 || this.actor.accessCode === 3;

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

    afterRender: function () {
        ACDC.CabinetElevation.superclass.afterRender.apply(this, arguments);
        this.loadMask = new Ext.LoadMask(this.bwrap, {});
    },

    closePanel: function(button, e) {
        Ext.getCmp('east-panel').collapse();
    },

    findAssetByElevation: function (assets, elevation) {
        for (var i = 0; i < assets.length; i++) {
            if (parseInt(assets[i].elevation) === parseInt(elevation)) {
                return assets[i];
            }
        }
        return null;
    },

    cabinetDetails: function() {
        this.fireEvent('showcabinetdetails', this, this.cabinet);
    },

    findAssetImage: function(asset) {
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

    getCabinetElevation: function(cabinet, assetId) {
        this.loadMask.show("Loading elevation...");
        Ext.Ajax.request({
           url:        'php/get_cabinet_details.php',
           params:     {
               cabinetId: cabinet.get('id')
           },
           scope:      this,
           mycallback: function (json, options) {
               this.loadMask.hide();
               /** @namespace json.ruHash */
               this.ruHash = json.ruHash;
               /** @namespace json.ruResHash */
               this.ruResHash = json.ruResHash;
               this.show(cabinet, json.assets, json.cabinetType, json.exceptions, assetId);
           },
            myerrorcallback: function(json, options) {
                this.loadMask.hide();
            }
       });
    },

    show: function (cabinet, assets, cabinetType, exceptions, assetId) {
        this.cabinet = cabinet;
        this.cabinet.name = cabinet.get('label');
        this.cabinet.assets = assets;
        this.cabinet.cabinetType = cabinetType;

        var assetImages = this.assetImages,
            a, i, j, ru, large,
            blade,
            tdAssets = [],
            imageFound,
            image,
            re,
            length,
            html = "",
            lastRu = parseInt(cabinetType.elevation);

        // if only 1 asset with a height of 44 RUs, it must be a storage array such as an EMC VMAX
        if (assets.length === 1 && assets[0].numRUs === cabinetType.elevation) {
            a = assets[0];
            html += "<div id='cab-title' class='cab-array-title'>" + cabinet.get('label');
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

                for (ru = cabinetType.elevation; ru > 0; ru--) {
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
                        for (large = 1; large < a.numRUs - 1; large++) {
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
                html += "<td class='cab-td-bottom'></td>";
                html += "</tr></table>";
                html += "</div>";
            }

            this.update(html);
            this.addQuickTipAsset(a);
            return;
        }

        html = "<div>";
        html += "<div id='cab-title' class='cab-title'>" + cabinet.get('label');
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


        for (ru = parseInt(cabinetType.elevation); ru > 0; ru--) {
            a = this.findAssetByElevation(assets, ru);
            if (a) {
                // this is an HP Chassis
                /** @namespace a.blades */
                if (a.blades.length > 0) {
                    html += "<tr class='cab-tr'>";
                    html += "  <td rowspan='10' valign='top'>";
                    html += "    <div class='cab-hp-chassis'>";
                    html += "      <table cellspacing='0' cellpadding='0' class='cab-hp-chassis-table'>";
                    html += "        <tr>";
                    for (i = 1; i <= 8; i++) {
                        blade = a.blades[i];

                        /** @namespace blade.fullHeight */
                        /** @namespace blade.dbId */
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
                    for (i = 9; i <= 16; i++) {
                        blade = a.blades[i];
                        if (typeof blade != "undefined") {
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

                // not an HP Chassis
                else {
                    imageFound = 0;
                    for (i = 0; i < assetImages.length; i++) {
                        image = assetImages[i];
                        /** @namespace image.man */
                        /** @namespace image.rus */
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

                            for (j = 1; j < image.rus; j++) {
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
                            for (large = 1; large < a.numRUs - 1; large++) {
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
                // empty, unusable or reserved RU

                // reserved RU
                if (typeof this.ruResHash !== "undefined" && typeof this.ruResHash[ru] !== "undefined") {
                    html += "<tr class='cab-tr' style='cursor: pointer;'>";
                    html += "<td id='ru-" + ru + "' class='cab-ru-empty cab-ru-reserved' ";
                    html += "onmouseover=Ext.get('ru-" + ru + "').addClass('cab-mouseover') " +
                            "onmouseout=Ext.get('ru-" + ru + "').removeClass('cab-mouseover') " +
                            "oncontextmenu='app.cabinetElevation.showContextMenu(event," + ru + ");' " +
                            "onclick='app.cabinetElevation.onRUClick(event," + ru + ");'>";
                    html += "<span id='span-ru-" + ru + "' class='cab-ru-reservation-label'>R" + this.ruResHash[ru].id + ": " + this.ruResHash[ru].projectName + "</span>";
                    html += "  </td><td class='cab-ru-number'>" + ru + "</td></tr>";

                    var numRUs = parseInt(this.ruResHash[ru].numRUs);
                    for (i = 1; i<numRUs; i++) {
                        ru--;
                        html += "<tr class='cab-tr' style='cursor: pointer;'>";
                        html += "  <td id='ru-" + ru + "' class='cab-ru-empty cab-ru-reserved cab-ru-reserved-contiguous' ";
                        html += "&nbsp;</td><td class='cab-ru-number'>" + ru + "</td></tr>";
                    }
                }
                // Empty RU
                else if (typeof this.ruHash === "undefined" || typeof this.ruHash[ru] === "undefined" ||
                    typeof this.ruHash[ru].usable === "undefined" || parseInt(this.ruHash[ru].usable)) {
                    // usable RU
                    html += "<tr class='cab-tr' style='cursor: pointer;'>";
                    html += "<td id='ru-" + ru + "' class='cab-ru-empty' ";
                    html += "onmouseover=Ext.get('ru-" + ru + "').addClass('cab-mouseover') " +
                            "onmouseout=Ext.get('ru-" + ru + "').removeClass('cab-mouseover') " +
                            "oncontextmenu='app.cabinetElevation.showContextMenu(event," + ru + ");' " +
                            "onclick='app.cabinetElevation.onRUClick(event," + ru + ");'>";
                    html += "&nbsp;</td><td class='cab-ru-number'>" + ru + "</td></tr>";
                }
                // unusable RU
                else if (!parseInt(this.ruHash[ru].usable)) {
                    // unusable RU
                    html += "<tr class='cab-tr' style='cursor: pointer;'>";
                    html += "  <td id='ru-" + ru + "' class='cab-ru-empty cab-ru-unusable' ";
                    html += "onmouseover=Ext.get('ru-" + ru + "').addClass('cab-mouseover') " +
                            "onmouseout=Ext.get('ru-" + ru + "').removeClass('cab-mouseover') " +
                            "oncontextmenu='app.cabinetElevation.showContextMenu(event," + ru + ");' " +
                            "onclick='app.cabinetElevation.onRUClick(event," + ru + ");'>";
                    html += "&nbsp;</td><td class='cab-ru-number'>" + ru + "</td></tr>";
                }
            }
            lastRu = ru;
        }

        html += [
            "</table></div></td></tr>",
            "  <tr>",
            "    <td class='cab-td-bottom'></td>",
            "  </tr>",
            "</table>",
            "</div>"].join("");

        this.update(html);

        for (i = 0; i < tdAssets.length; i++) {
            a = tdAssets[i];
            if (a.dbId) {
                this.addQuickTipBlade(a);
            }
            else {
                this.addQuickTipAsset(a);
            }
        }

        for (var prop in this.ruResHash) {
            if (this.ruResHash.hasOwnProperty(prop)) {
                this.addQuickTipReservation(this.ruResHash[prop]);
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

        for (ru in this.selectedRUs) {
            if (this.selectedRUs.hasOwnProperty(ru)) {
                delete this.selectedRUs[ru];
            }
        }

        // for testing purposes
        if (this.gotoAsset) {
            this.app.assetDetails.showAsset.defer(500, this.app.assetDetails, [this.gotoAsset]);
        }
    },

    onRUClick: function(e, ru) {
        var i,
            ruUsable = typeof this.ruHash === "undefined" || typeof this.ruHash[ru] === "undefined" || parseInt(this.ruHash[ru].usable) ? 1 : 0;

        // if not usable then do not select
        if (!ruUsable) {
            return;
        }

        this.initRU(ru);

        if (this.ruHash[ru].selected) {
            this.unselectRU(ru);
        } else {
            this.selectRU(ru);

            // if this is a shift-click then we need to select all RUs between this RU and the next higher selected
            if (e.shiftKey) {
                if (this.lastSelected > ru) {
                    // first selected was higher than this
                    for (i=ru+1; i<=44; i++) {
                        this.initRU(i);
                        if (this.ruHash[i].selected) break;
                        this.selectRU(i);
                    }
                } else {
                    for (i=this.lastSelected+1; i<=ru; i++) {
                        this.initRU(i);
                        if (this.ruHash[i].selected) break;
                        this.selectRU(i);
                    }
                }

                // unselect all elements caused by using the shift key
                if (typeof window.getSelection !== "undefined") {
                    // for most browsers
                    window.getSelection().removeAllRanges();
                } else if (typeof document.selection !== "undefined") {
                    // old explorer versions (<9)
                    document.selection.empty();
                }
            }
            this.lastSelected = ru;
        }
    },

    initRU: function(ru) {
        if (typeof this.ruHash[ru] === "undefined") {
            this.ruHash[ru] = {
                id: 0,
                cabinetId: this.cabinet.id,
                ruNumber: ru,
                usable: 1,
                selected: 0
            }
        }
    },

    unselectRU: function(ru) {
        this.ruHash[ru].selected = 0;
        delete this.selectedRUs[ru];
        Ext.get("ru-" + ru).removeClass("cab-ru-selected");

        console.log("CabinetElevation::selectRU(" + ru + ")");
        for (ru in this.selectedRUs) {
            if (this.selectedRUs.hasOwnProperty(ru))
            console.log("RU: " + ru);
        }
    },

    selectRU: function(ru) {
        this.ruHash[ru].selected = 1;
        this.selectedRUs[ru] = this.ruHash[ru];
        Ext.get("ru-" + ru).addClass("cab-ru-selected");

        console.log("CabinetElevation::selectRU(" + ru + ")");
        for (ru in this.selectedRUs) {
            if (this.selectedRUs.hasOwnProperty(ru))
            console.log("RU: " + ru);
        }
    },

    showContextMenu: function(e, ru) {
        var event = e ? e : window.event,
            x = e.clientX,
            y = e.clientY,
            me = this,
            updateRU = this.updateRU,
            newReservation = this.newReservation,
            modifyReservation = this.modifyReservation,
            cancelReservation = this.cancelReservation,
            cabinet = this.cabinet,
            ruHash = this.ruHash,
            ruResHash = this.ruResHash,
            selectedRUs = this.selectedRUs,
            ruUsable = typeof ruHash === "undefined" || typeof ruHash[ru] === "undefined" || parseInt(ruHash[ru].usable) ? 1 : 0,
            ruReserved = typeof ruResHash !== "undefined" && typeof ruResHash[ru] !== "undefined" ? 1 : 0;

        if (typeof selectedRUs[ru] === "undefined") {
            selectedRUs[ru] = ruHash[ru];
        }

        var menu = new Ext.menu.Menu({
            shadow: 'drop',
            items:  [
                {
                    text: '&nbsp; &nbsp; &nbsp; &nbsp; RU ' + ru,
                    xtype: 'menutextitem'
                },
                '-',
                {
                    text: 'Usable',
                    iconCls: 'usable',
                    hidden: this.editableByUser ? false : true,
                    disabled: ruReserved,
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                xtype: 'menucheckitem',
                                text: 'Yes',
                                id: 'menu-ru-usable-yes',
                                group: 'menu-ru-usable',
                                checked: ruUsable,
                                handler: function() {
                                    updateRU(me, ruHash, cabinet, ru, 1);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            }, {
                                xtype: 'menucheckitem',
                                text: 'No',
                                id: 'menu-ru-usable-no',
                                group: 'menu-ru-usable',
                                checked: !ruUsable,
                                handler: function() {
                                    updateRU(me, ruHash, cabinet, ru, 0);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            }
                        ]
                    }
                },
                {
                    text: 'Reservation',
                    iconCls:  'reservations',
                    hidden: this.editableByUser ? false : true,
                    disabled: !ruUsable,
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text: "New",
                                iconCls:  'reservation-new',
                                hidden: this.editableByUser ? false : true,
                                disabled: ruReserved || !ruUsable,
                                handler: function() {
                                    newReservation(me, ruHash, selectedRUs, cabinet);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            },
                            {
                                text: "Modify",
                                iconCls:  'reservation-modify',
                                hidden: this.editableByUser ? false : true,
                                disabled: !ruReserved,
                                handler: function() {
                                    modifyReservation(me, ru, ruResHash[ru], cabinet);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            },
                            {
                                text: "Cancel",
                                iconCls:  'reservation-cancel',
                                hidden: this.editableByUser ? false : true,
                                disabled: !ruReserved,
                                handler: function() {
                                    cancelReservation(me, ru, ruResHash[ru], cabinet);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            }
                        ]
                    }
                }
            ]
        });
        menu.showAt([x + 10, y + 10]);
    },

    // TODO: insure that num assets and RUs/asset match the total number of selected RUs
    newReservation: function(scope, ruHash, selectedRUs, cabinet) {
        var reservationForm,
            reserveRUsWindow,
            numSelectedRUs = 0,
            makeReservations = scope.makeReservations;


        for (var k in selectedRUs) {
            if (selectedRUs.hasOwnProperty(k)) {
                numSelectedRUs++;
            }
        }

        reservationForm = new Ext.form.FormPanel({
            layout:       'form',
            frame:        true,
            labelWidth:   200,
            defaultType:  'textfield',
            monitorValid: true,
            items:        [
                {
                    xtype: 'label',
                    html: '<br><span style="font-size:12px;"><b>Note:</b> The following 4 fields are required. The submit button will not be enabled until all 4 are filled out.<br><br>'
                },
                {
                    xtype:      'textfield',
                    id:         'project-name',
                    fieldLabel: '<span style="color:red;">*</span> Project Name',
                    allowBlank:  false,
                    width:      200
                },
                {
                    xtype:      'datefield',
                    id:         'estimated-install-date',
                    fieldLabel: '<span style="color:red;">*</span> Est Install Date',
                    allowBlank:  false,
                    editable:    false,
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'num-assets',
                    fieldLabel: '<span style="color:red;">*</span> Number of Assets',
                    allowBlank:  false,
                    width:      200,
                    value:      numSelectedRUs
                },
                new Ext.form.ComboBox({
                    width:      200,
                    id: 'num-rus',
                    fieldLabel: '<span style="color:red;">*</span> Number of RUs per Asset',
                    typeAhead: false,
                    triggerAction: 'all',
                    lazyRender:true,
                    mode: 'local',
                    store: new Ext.data.ArrayStore({
                        id: 0,
                        fields: [
                            'numRUs',
                            'display'
                        ],
                        data: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]]
                    }),
                    valueField: 'numRUs',
                    displayField: 'display',
                    value: 1
                }),
                {
                    xtype: 'label',
                    html: '<br><br><span style="font-size:12px;"><b>Note:</b> The following fields are optional and will be used for all reservations created by this form, but they can be modified later by right-clicking on the reservation in the cabinet and selecting Reservation->Modify.<br><br>'
                },
                new Ext.form.ComboBox({
                    width:      200,
                    id: 'business-service',
                    fieldLabel: 'Business Service',
                    typeAhead: true,
                    triggerAction: 'all',
                    lazyRender:true,
                    store: new Ext.data.Store({
                                baseParams: {
                                    itemName: 'businessService'
                                },
                                proxy:      new Ext.data.HttpProxy(
                                    {
                                        url:        'php/get_asset_combo_items.php'
                                    }),
                                reader:     new Ext.data.JsonReader(
                                    {
                                        root:          'items',
                                        totalProperty: 'total'
                                    }, [
                                        {name: 'id', type: 'string'},
                                        {name: 'name', type: 'string'}
                                    ]),
                                listeners: {
                                    scope: this,
                                    load:  function (store, records, options) {
                                        if (this.itemName === "numrus") {
                                            this.fireEvent('numrusloaded', this, records, options);
                                        }
                                    }
                                }
                            })          ,
                    valueField: 'id',
                    displayField: 'name'
                }),
                {
                    xtype:      'textfield',
                    id:         'asset-name',
                    fieldLabel: 'Asset Name',
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'model',
                    fieldLabel: 'Model',
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'serial-number',
                    fieldLabel: 'Serial Number',
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'asset-tag',
                    fieldLabel: 'Asset Tag',
                    width:      200
                }
            ],
            buttons:      [
                {
                    text:     'Submit',
                    formBind: true,
                    scope:    this,
                    handler:  function() {
                        makeReservations(scope, ruHash, selectedRUs, cabinet);
                        (function() {
                            reservationForm.destroy();
                            reserveRUsWindow.destroy();
                        }).defer(500);
                    }
                },
                {
                    text:    'Cancel',
                    scope:   this,
                    handler: function() {
                        (function() {
                            reservationForm.destroy();
                            reserveRUsWindow.destroy();
                        }).defer(500);
                    }
                }
            ]
        });

        // create and show window
        reserveRUsWindow = new Ext.Window({
            title: 'Reserve RUs',
            modal: true,
            constrain: true,
            width: 600,
            height: 400,
            layout: 'fit',
            closable: false,
            border: false,
            items: [
                reservationForm
            ],
            listeners: {
                close: function() {
                    (function() {
                        reservationForm.destroy();
                        reserveRUsWindow.destroy();
                    }).defer(500);
                }
            }
        });
        reserveRUsWindow.show();
    },

    makeReservations: function(scope, ruHash, selectedRUs, cabinet) {
        var projectName = Ext.getCmp('project-name').getValue(),
            numAssets = Ext.getCmp('num-assets').getValue(),
            numRUsPerAsset = Ext.getCmp('num-rus').getValue(),
            reservation,
            ruNumbers,
            ruArray = [],
            x = Ext.getCmp('estimated-install-date').getValue(),
            estimatedInstallDate = x.getFullYear()+"-"+(x.getMonth()+1)+"-"+x.getDate();


        // create an array of RU numbers. We'll use this to join with a comma later
        for (var k in selectedRUs) {
            if (selectedRUs.hasOwnProperty(k)) {
                ruArray.push(k);
            }
        }
        // reverse sort this array
        ruArray.sort(function(a, b) {
            a = parseInt(a);
            b = parseInt(b);
            if (a > b) return -1;
            if (a < b) return 1;
            return 0;
        });

        // loop over the number of assets to be reserved (from the form) and create
        // a reservation for each
        for (var i=0; i<numAssets; i++) {
            // use the ruArray to create an array of RUs for this reservation based upon
            // numRUsPerAsset (from the form)
            ruNumbers = [];
            for (var j=0; j<numRUsPerAsset; j++) {
                ruNumbers.push(ruArray.shift());
            }

            // res params for ajax call
            reservation = {
                id: 0,
                cabinetId: cabinet.id,
                elevation: ruNumbers[0],
                numRUs: ruNumbers.length,
                ruNumbers: ruNumbers.join(","),
                projectName: projectName,
                estimatedInstallDate: estimatedInstallDate,
                businessServiceId: Ext.getCmp('business-service').getValue() ? Ext.getCmp('business-service').getValue() : "",
                businessService: Ext.getCmp('business-service').lastSelectionText ? Ext.getCmp('business-service').lastSelectionText : "",
                assetName: Ext.getCmp('asset-name').getValue() ? Ext.getCmp('asset-name').getValue() : "",
                model: Ext.getCmp('model').getValue() ? Ext.getCmp('model').getValue() : "",
                serialNumber: Ext.getCmp('serial-number').getValue() ? Ext.getCmp('serial-number').getValue() : "",
                assetTag: Ext.getCmp('asset-tag').getValue() ? Ext.getCmp('asset-tag').getValue() : ""
            };
            Ext.Ajax.request({
                url:        'php/save_ru_reservation.php',
                params: JSON.stringify(reservation),
                mycallback: function(json, options) {
                    scope.getCabinetElevation(cabinet);
                }
            });
        }
    },

    modifyReservation: function(scope, ru, res, cabinet) {
        var form,
            formWindow,
            updateReservation = scope.updateReservation;

        form = new Ext.form.FormPanel({
            layout:       'form',
            frame:        true,
            labelWidth:   200,
            monitorValid: true,
            items:        [
                {
                    xtype:      'textfield',
                    id:         'project-name',
                    fieldLabel: 'Project Name',
                    allowBlank:  false,
                    value:      res.projectName,
                    width:      200
                },
                {
                    xtype:      'datefield',
                    id:         'estimated-install-date',
                    fieldLabel: 'Est Install Date',
                    allowBlank:  false,
                    editable:    false,
                    value:      res.estimatedInstallDate,
                    width:      200
                },
                new Ext.form.ComboBox({
                    width:      200,
                    minChars: 3,
                    id: 'business-service',
                    fieldLabel: 'Business Service',
                    typeAhead: true,
                    triggerAction: 'all',
                    lazyRender: true,
                    model: 'local',
                    store: new Ext.data.Store({
                        autoLoad: true,
                        baseParams: {
                            itemName: 'businessService'
                        },
                        proxy:      new Ext.data.HttpProxy(
                            {
                                url:        'php/get_asset_combo_items.php'
                            }),
                        reader:     new Ext.data.JsonReader(
                            {
                                root:          'items',
                                totalProperty: 'total'
                            }, [
                                {name: 'id', type: 'string'},
                                {name: 'name', type: 'string'}
                            ]),
                        listeners: {
                            scope: this,
                            load:  function (store, records, options) {
                                if (this.itemName === "numrus") {
                                    this.fireEvent('numrusloaded', this, records, options);
                                }
                            }
                        }
                    }),
                    valueField: 'id',
                    displayField: 'name',
                    value: res.businessService
                }),
                {
                    xtype:      'textfield',
                    id:         'asset-name',
                    value:      res.assetName,
                    fieldLabel: 'Asset Name',
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'model',
                    fieldLabel: 'Model',
                    value:      res.model,
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'serial-number',
                    fieldLabel: 'Serial Number',
                    value:      res.serialNumber,
                    width:      200
                },
                {
                    xtype:      'textfield',
                    id:         'asset-tag',
                    fieldLabel: 'Asset Tag',
                    value:      res.assetTag,
                    width:      200
                }
            ],
            buttons:      [
                {
                    text:     'Submit',
                    formBind: true,
                    scope:    this,
                    handler:  function() {
                        var x = Ext.getCmp('estimated-install-date').getValue(),
                        estimatedInstallDate = x.getFullYear()+"-"+(x.getMonth()+1)+"-"+x.getDate();

                        res.projectName = Ext.getCmp('project-name').getValue();
                        res.estimatedInstallDate = estimatedInstallDate;
                        res.businessServiceId = Ext.getCmp('business-service').getValue() ? Ext.getCmp('business-service').getValue() : "";
                        res.businessService = Ext.getCmp('business-service').lastSelectionText ? Ext.getCmp('business-service').lastSelectionText : "";
                        res.assetName = Ext.getCmp('asset-name').getValue() ? Ext.getCmp('asset-name').getValue() : "";
                        res.model = Ext.getCmp('model').getValue() ? Ext.getCmp('model').getValue() : "";
                        res.serialNumber = Ext.getCmp('serial-number').getValue() ? Ext.getCmp('serial-number').getValue() : "";
                        res.assetTag = Ext.getCmp('asset-tag').getValue() ? Ext.getCmp('asset-tag').getValue() : "";
                        updateReservation(scope, ru, res, cabinet);
                        (function() {
                            form.destroy();
                            formWindow.destroy();
                        }).defer(500);
                    }
                },
                {
                    text:    'Cancel',
                    scope:   this,
                    handler: function() {
                        (function() {
                            form.destroy();
                            formWindow.destroy();
                        }).defer(500);
                    }
                }
            ]
        });

        // create and show window
        formWindow = new Ext.Window({
            title: 'Modify RU Reservation',
            modal: true,
            constrain: true,
            width: 600,
            height: 400,
            layout: 'fit',
            closable: false,
            border: false,
            items: [
                form
            ],
            listeners: {
                close: function() {
                    (function() {
                        form.destroy();
                        formWindow.destroy();
                    }).defer(500);
                }
            }
        });
        formWindow.show();
    },

    updateReservation: function(scope, ru, res, cabinet) {
        res.action = "update";
        Ext.Ajax.request({
            url:        'php/save_ru_reservation.php',
            params: JSON.stringify(res),
            mycallback: function(json, options) {
                scope.getCabinetElevation(cabinet);
            }
        });
    },

    cancelReservation: function(scope, ru, res, cabinet) {
        res.action = "delete";
        Ext.Ajax.request({
            url:        'php/save_ru_reservation.php',
            params: JSON.stringify(res),
            mycallback: function(json, options) {
                scope.getCabinetElevation(cabinet);
            }
        });
    },

    updateRU: function(scope, ruHash, cabinet, ru, ruUsable) {
        var ruId = typeof ruHash !== "undefined" && typeof ruHash[ru] !== "undefined" ? parseInt(ruHash[ru].id) : 0;

        Ext.Ajax.request({
            url:        'php/save_ru.php',
            params: JSON.stringify({
                action: "save",
                id: ruId,
                cabinetId: cabinet.id,
                ruNumber: ru,
                usable: ruUsable
            }),
            mycallback: function(json, options) {
                scope.getCabinetElevation(cabinet);
                for (var ru in this.selectedRUs) {
                    if (scope.selectedRUs.hasOwnProperty(ru)) {
                        delete scope.selectedRUs[ru];
                    }
                }
            }
        });
    },

    clearDetails: function() {
        this.update('');
    },

    addQuickTipAsset: function (a) {
        var e = Ext.get('asset-id-' + a.id);
        var html = [
            "Name: " + a.name + "<br>",
            "Label: " + a.label + "<br>",
            "Man: " + a.manufacturer + "<br>",
            "Model: " + a.model + "<br>",
            "SN: " + a.serialNumber + "<br>",
            "Asset: " + a.assetTag + "<br>"
        ].join("");

        this.registerQuickTip(e, html);
    },

    addQuickTipReservation: function(res) {
        var eTd = Ext.get('ru-' + res.elevation),
            eSpan = Ext.get('span-ru-' + res.elevation);
        var html = [
            "Project Name: " + res.projectName + "<br>",
            "Asset Name: " + res.assetName + "<br>",
            "Model: " + res.model + "<br>",
            "Serial Num: " + res.serialNumber + "<br>",
            "Asset Tag: " + res.assetTag + "<br>"
        ].join("");

        this.registerQuickTip(eTd, html);
        this.registerQuickTip(eSpan, html);
    },

    addQuickTipBlade: function (b) {
        var e = Ext.get('asset-id-' + b.dbId),
            html;

        /** @namespace image.fqdn */
        /** @namespace image.man */
        /** @namespace image.deviceName */
        /** @namespace image.productName */
        html = [
            "Name: " + (b.fqdn ? b.fqdn : b.deviceName) + "<br>",
            "Man: HP<br>",
            "Model: " + b.productName + "<br>",
            "SN: " + b.serialNumber + "<br>"
        ].join("");

        this.registerQuickTip(e, html);
    },

    registerQuickTip: function (e, html) {
        Ext.QuickTips.register({
            target: e,
            text:   html
        });
    }
});


