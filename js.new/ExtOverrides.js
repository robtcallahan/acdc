/*******************************************************************************
 *
 * $Id: ExtOverrides.js 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ExtOverrides.js $
 *
 *******************************************************************************
 */

// Overriding the load mask function so that we can pass a custom message
Ext.LoadMask.prototype.onBeforeLoad = function(msg) {
    if(!this.disabled) {
        if (arguments.length === 1 && typeof msg !== 'undefined') {
            this.el.mask(msg, this.msgCls);
        } else {
            this.el.mask(this.msg, this.msgCls);
        }
    }
};

Ext.LoadMask.prototype.show = function (msg) {
    this.onBeforeLoad(msg);
};




