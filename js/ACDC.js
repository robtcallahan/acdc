/*******************************************************************************
 *
 * $Id: ACDC.js 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ACDC.js $
 *
 *******************************************************************************
 */

Ext.BLANK_IMAGE_URL = "/ext/resources/images/default/s.gif";

var app = null;

// application main entry point
// Ext.onReady() is called when all files have been loaded into the browser and the DOM is ready
Ext.onReady(function ()
{
    // Enable quick tips
    Ext.QuickTips.init();
    Ext.apply(Ext.QuickTips.getQuickTip(), {
        minWidth:     100,
        showDelay:    500,
        trackMouse:   true,
        dismissDelay: 0
    });

    if (ACDC.agent === "tablet") {
        app = new ACDC.AppTablet({
            env:       ACDC.env,
            release:   ACDC.release,
            actor:     ACDC.actor,
            agent:     ACDC.agent,
            imagesDir: ACDC.imagesDir,
            locationHashById: Ext.util.JSON.decode(ACDC.locationHashById),
            locationHashByName: Ext.util.JSON.decode(ACDC.locationHashByName),
            assetImages: Ext.util.JSON.decode(ACDC.assetImages)
        });
    }
    else {
        app = new ACDC.App({
            env:       ACDC.env,
            release:   ACDC.release,
            actor:     ACDC.actor,
            agent:     ACDC.agent,
            imagesDir: ACDC.imagesDir,
            locationHashById: Ext.util.JSON.decode(ACDC.locationHashById),
            locationHashByName: Ext.util.JSON.decode(ACDC.locationHashByName),
            assetImages: Ext.util.JSON.decode(ACDC.assetImages)
        });
    }
});




