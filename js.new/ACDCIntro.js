/*******************************************************************************
 *
 * $Id: ACDCIntro.js 77404 2013-08-01 15:47:42Z rcallaha $
 * $Date: 2013-08-01 11:47:42 -0400 (Thu, 01 Aug 2013) $
 * $Author: rcallaha $
 * $Revision: 77404 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ACDCIntro.js $
 *
 *******************************************************************************
 */

Ext.BLANK_IMAGE_URL = "/ext/resources/images/default/s.gif";

var app = null;

// application main entry point
// Ext.onReady() is called when all files have been loaded into the browser and the DOM is ready
Ext.onReady(function ()
{
    app = new ACDC.Intro({
        imagesDir: ACDC.imagesDir
    });
});




