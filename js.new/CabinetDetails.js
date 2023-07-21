/*******************************************************************************
 *
 * $Id: CabinetDetails.js 79752 2013-10-10 18:44:06Z rcallaha $
 * $Date: 2013-10-10 14:44:06 -0400 (Thu, 10 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79752 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/CabinetDetails.js $
 *
 *******************************************************************************
 */


// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.CabinetDetails = Ext.extend(Ext.Panel, {

    initComponent: function ()
    {
        this.topToolbar = new Ext.Toolbar({
            items: [
                {
                    xtype:    'button',
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
            autoScroll: true,
            loadMask:   {
                msg: "Loading cabinet..."
            },
            bodyStyle: 'height: 100%'
        });

        ACDC.CabinetDetails.superclass.initComponent.apply(this, arguments);
    },

    closePanel: function(button, e)
    {
        Ext.getCmp('cabinet-details-panel').collapse();
    },

    clearData: function()
    {
        this.update("");
    },

    show: function(cabinet)
    {
        var assets = cabinet.assets,
            a,
            elevationClass,
            numRUsClass,
            html = [
                "<div>",
                "  <div class='cab-details-title'>" + cabinet.name + "</div>",
                "  <table class='cab-table' cellpadding=0 cellspacing=0>"
            ].join("");


        assets.sort(this.sortByElevation);

        for (var i=0; i<assets.length; i++) {
            a = assets[i];

            elevationClass = "";
            numRUsClass = "";
            if (a.elevation === 0) {
                elevationClass = "class='cab-details-elevation-missing'";
            }
            if (a.numRUs === 0) {
                numRUsClass = "class='cab-details-numrus-missing'";
            }
            html += [
                "<tr><td colspan=3 class='cab-details-asset-name' onclick=app.assetDetails.showAsset(" + a.id + ");>" + a.label + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Label:</td><td>" + a.label + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>CMDB Name:</td><td>" + a.cmdbLink + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Manufacturer:</td><td>" + a.manufacturer + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Model:</td><td>" + a.model + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Serial Number:</td><td>" + a.serialNumber + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Asset Number:</td><td>" + a.assetTag + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Elevation:</td><td " + elevationClass + ">" + a.elevation + "</td></tr>",
                "<tr><td class='cab-details-spacer'>&nbsp;</td><td class='cab-details-td'>Num RUs:</td><td " + numRUsClass + ">" + a.numRUs + "</td></tr>"
            ].join("");

        }
        html += "</table>";
        this.update(html);
    },

    sortByElevation: function(a, b)
    {
        var weight;
        if (a.elevation > b.elevation && b.elevation !== 0) {
            weight = -1;
        } else if (a.elevation < b.elevation && a.elevation !== 0) {
            weight = 1;
        } else {
            weight = 0;
        }

        if (a.elevation === 0 || b.elevation === 0) {
            weight = -1;
        }
        return weight;
    }
});

// override the panel expansion function so we can collapse the other panel first
Ext.override(Ext.Panel, {
    expand: function(animate) {
        if (this.id === 'cabinet-details-panel') {
            Ext.getCmp('asset-details-panel').collapse();
        }
        if (this.id === 'asset-details-panel') {
            Ext.getCmp('cabinet-details-panel').collapse();
        }

        if(!this.collapsed || this.el.hasFxBlock() || this.fireEvent('beforeexpand', this, animate) === false){
            return;
        }
        var doAnim = animate === true || (animate !== false && this.animCollapse);
        this.el.removeClass(this.collapsedCls);
        this.beforeEffect(doAnim);
        this.onExpand(doAnim, animate);
        return this;
    }
});


