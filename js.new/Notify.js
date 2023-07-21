/*!
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * Ext.App
 * @extends Ext.util.Observable
 * @author Chris Scott
 */
Ext.Notify = function (config)
{

    // set up StateProvider
    this.initStateProvider();

    // array of views
    this.views = [];

    Ext.apply(this, config);
    if (!this.api.actions) {
        this.api.actions = {};
    }

    // init when onReady fires.
    Ext.onReady(this.onReady, this);

    Ext.Notify.superclass.constructor.apply(this, arguments);
}
Ext.extend(Ext.Notify, Ext.util.Observable, {

    /***
     * response status codes.
     */
    STATUS_EXCEPTION:        "Exception",
    STATUS_VALIDATION_ERROR: "Validation",
    STATUS_ERROR:            "ERROR! Oh man! This is NOT good",
    STATUS_NOTICE:           "Notice",
    STATUS_INFO:             "Info",
    STATUS_OK:               "OK",
    STATUS_HELP:             "Help a guy out",

    /**
     * @cfg {Object} api
     * remoting api.  should be defined in your own config js.
     */
    api:      {
        url:     null,
        type:    null,
        actions: {}
    },

    // delays
    stdDelay: 2,
    errDelay: 9,

    // private, ref to message-box Element.
    msgCt:    null,

    // @protected, onReady, executes when Ext.onReady fires.
    onReady:  function ()
    {
        // create the msgBox container.  used for Notify.setAlert
        this.msgCt = Ext.DomHelper.insertFirst(document.body, {id: 'msg-div'}, true);
        this.msgCt.setStyle('position', 'absolute');
        this.msgCt.setStyle('z-index', 9999);
        this.msgCt.setStyle('top', '10%');
        this.msgCt.setStyle('left', '45%');
        this.msgCt.setWidth(200);
    },

    initStateProvider: function ()
    {
        /*
         * set days to be however long you think cookies should last
         */
        var days = '';        // expires when browser closes
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var exptime = "; expires=" + date.toGMTString();
        }
        else {
            var exptime = null;
        }

        // register provider with state manager.
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            path:    '/',
            expires: exptime,
            domain:  null,
            secure:  false
        }));
    },

    /***
     * setAlert
     * show the message box.  Aliased to addMessage
     * @param {String} msg
     * @param {Boolean} status
     * @param {Number} delay
     */
    setAlert: function (status, msg, delay)
    {
        if (typeof delay === "undefined") {
            delay = this.stdDelay;
        }
        if (status === this.STATUS_ERROR) {
            delay = this.errDelay;
        }

        this.addMessage(status, msg, delay);
    },

    /***
     * adds a message to queue.
     * @param {String} msg
     * @param {Boolean} status
     * @param {Number} delay
     */
    addMessage: function (status, msg, delay)
    {
        //this.msgCt.alignTo(document, 't-t');
        Ext.DomHelper.append(this.msgCt, {html: this.buildMessageBox(status, String.format.apply(String, Array.prototype.slice.call(arguments, 1)))}, true).slideIn('t').pause(delay).ghost("t", {remove: true});
    },

    /***
     * buildMessageBox
     */
    buildMessageBox: function (title, msg)
    {
        switch (title) {
            case true:
                title = this.STATUS_OK;
                break;
            case false:
                title = this.STATUS_ERROR;
                break;
        }
        //'<table cellspacing="0" class="x-btn x-btn-noicon" id="cell-mouseover" style="width: 75px;"><tbody class="x-btn-small x-btn-icon-small-left"><tr><td class="x-btn-tl"><i>&nbsp;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&nbsp;</i></td></tr><tr><td class="x-btn-ml"><i>&nbsp;</i></td><td class="x-btn-mc"><h3 class="x-icon-text icon-status-' + title + '">', title, '</h3>', msg, '</td><td class="x-btn-mr"><i>&nbsp;</i></td></tr><tr><td class="x-btn-bl"><i>&nbsp;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&nbsp;</i></td></tr></tbody></table>'
        return [
            '<div id="message-box" class="x-box">',
            '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
            '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3 class="x-icon-text icon-status-' + title + '">', title, '</h3>', msg, '</div></div></div>',
            '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
            '</div>'
        ].join('');
    },

    /**
     * decodeStatusIcon
     * @param {Object} status
     */
    decodeStatusIcon: function (status)
    {
        iconCls = '';
        switch (status) {
            case true:
            case this.STATUS_OK:
                iconCls = this.ICON_OK;
                break;
            case this.STATUS_NOTICE:
                iconCls = this.ICON_NOTICE;
                break;
            case false:
            case this.STATUS_ERROR:
                iconCls = this.ICON_ERROR;
                break;
            case this.STATUS_HELP:
                iconCls = this.ICON_HELP;
                break;
        }
        return iconCls;
    },

    /**
     * t
     * translation function.  needs to be implemented.  simply echos supplied word back currently.
     * @param {String} words
     * @return {String} translated.
     */
    t: function (words)
    {
        return words;
    },

    handleResponse: function (res)
    {
        if (res.type == this.STATUS_EXCEPTION) {
            return this.handleException(res);
        }
        if (res.message.length > 0) {
            this.setAlert(res.status, res.message);
        }
    },

    handleException: function (res)
    {
        Ext.MessageBox.alert(res.type.toUpperCase(), res.message);
    }
});
