/*******************************************************************************
 *
 * $Id: Cabinet.js 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/Cabinet.js $
 *
 *******************************************************************************
 */

Ext.namespace('ACDC');

ACDC.Cabinet = function(config) {
    this.objectType = 'cabinet';

    this.id = 0;
    this.name = "new";
    this.locationId = null;
    this.ctId = null;
    this.ctName = null;
    this.ctType = null;
    this.image = null;
    this.ctImageName = null;
    this.imageLoaded = false;
    this.ctLength = null;
    this.ctWidth = null;
    this.x = null;
    this.y = null;
    this.origX = null;
    this.origY = null;
    this.hasExceptions = false;
    this.exceptionsHtml = "";
    this.toolTipDisplayed = false;

    this.utilStatus = CABINETUTILOK;
    this.numRUsUsed = 0;
    this.numAssets = 0;

    /*
     for (var prop in config) {
     if (this.hasOwnProperty(prop)) {
     this[prop] = config[prop];
     }
     }
     */
    Ext.apply(this, config);

    this.textColor = "black";
    this.font = "normal 9px Arial Narrow";

    this.width = this.image.naturalWidth;
    this.height = this.image.naturalHeight;

    this.setX(config.x);
    this.setY(config.y);

    // define the upper-left and lower-right coordinates
    this.x1 = this.x;
    this.x2 = this.x1 + this.width;
    this.y1 = this.y;
    this.y2 = this.y1 + this.height;

    // origXY used to see if the item was moved. only save if it was moved
    this.origX = this.x;
    this.origY = this.y;

    // offset keeps track of where the mouse was click to select the rack
    this.selectX = null;
    this.selectY = null;

    // define the mid section for purposes of rectangle selection
    this.midX = this.x + this.width / 2;
    this.midY = this.y + this.height / 2;

    this.selected = false;
    this.highlighted = false;
};

ACDC.Cabinet.prototype = {

    getObjectType: function() {
        return this.objectType;
    },

    setId: function(id) {
        this.id = id;
    },

    getId: function() {
        return this.id;
    },

    setName: function(name) {
        this.name = name;
    },

    getName: function() {
        return this.name;
    },

    setX: function(x) {
        this.x = parseInt(x);
    },

    setY: function(y) {
        this.y = parseInt(y);
    },

    getX: function() {
        return this.x;
    },

    getY: function() {
        return this.y;
    },

    moveTo: function(x, y) {
        this.x = x;
        this.y = y;

        this.x1 = this.x;
        this.x2 = this.x1 + this.width;
        this.y1 = this.y;
        this.y2 = this.y1 + this.height;

        this.midX = this.x + this.width / 2;
        this.midY = this.y + this.height / 2;
    },

    remove: function(cb, cbScope) {
        Ext.Ajax.request({
            url: 'php/save_cabinet.php',
            params: {
                id: this.id,
                action: "delete"
            },
            scope: this,
            mycallback: function(json, options) {
                if (cb) cb.apply(cbScope);
            }
        });
    },

    save: function(cb, cbScope) {
        Ext.Ajax.request({
            url: 'php/save_cabinet.php',
            params: {
                id: this.id,
                name: this.name,
                ctId: this.ctId,
                locationId: this.locationId,
                x: this.x,
                y: this.y,
                action: "save"
            },
            scope: this,
            mycallback: function(json, options) {
                this.id = json.cabinet.id;
                this.origX = json.cabinet.x;
                this.origY = json.cabinet.y;
                this.selectX = json.cabinet.x;
                this.selectY = json.cabinet.y;
                this.x = json.cabinet.x;
                this.y = json.cabinet.y;
                if (cb) cb.apply(cbScope, [this]);
            }
        });
    },

    select: function() {
        if (this.debug > 2) console.log("Cabinet::select(): name=" + this.name);
        this.selected = true;
    },

    unselect: function() {
        if (this.debug > 2) console.log("Cabinet::unselect(): name=" + this.name);
        this.selected = false;
    },

    isSelected: function() {
        return this.selected;
    },

    highlight: function() {
        this.highlighted = true;
    },

    unhighlight: function() {
        this.highlighted = false;
    },

    isHighlighted: function() {
        return this.highlighted;
    },

    setUtilStatus: function(utilStatus) {
        this.utilStatus = utilStatus;
    },

    getUtilStatus: function() {
        return this.utilStatus;
    },

    setNumRUsUsed: function(numRUs) {
        this.numRUsUsed = numRUs;
    },

    getNumRUsUsed: function() {
        return this.numRUsUsed;
    },

    setNumAssets: function(numAssets) {
        this.numAssets = numAssets;
    },

    getNumAssets: function() {
        return this.numAssets;
    },

    setName: function(name) {
        this.name = name;
    },

    contains: function(m) {
        this.ctx.beginPath();
        this.ctx.globalAlpha = 0;
        this.ctx.rect(this.x, this.y, this.width, this.height);
        return this.ctx.isPointInPath(m.x, m.y);
    },

    draw: function(showUtilization, showExceptions) {
        if (this.debug > 2) console.log("Cabinet::draw(" + this.name + ")");
        var txtOffset = this.name.length * 6;

        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        this.ctx.save();
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.textColor;
        if (this.ctImageName.search(/pdu|sts/) !== -1) {
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.fillText(this.name, -this.y - (this.height / 2) - (txtOffset / 2), this.x + this.width + 9);
        }
        else {
            this.ctx.fillText(this.name, this.x + (this.width / 2) - (txtOffset / 2), this.y + this.height + 9);
        }
        this.ctx.restore();

        if (this.selected) {
            if (this.debug > 2) console.log("Cabinet::draw(): SELECTED");
            this.ctx.save();
            this.ctx.fillStyle = '#00F';
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
            this.ctx.restore();
        }

        if (this.highlighted) {
            if (this.debug > 2) console.log("Cabinet::draw(): HIGHLIGHTED");
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(this.x, this.y, this.width, this.height);
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = 'yellow';
            this.ctx.stroke();
            this.ctx.restore();
        }

        if (showUtilization && (this.utilStatus === CABINETUTILOK || this.utilStatus === CABINETUTILFULL)) {
            this.ctx.save();
            if (this.utilStatus === CABINETUTILOK) {
                this.ctx.fillStyle = 'green';
            } else {
                this.ctx.fillStyle = 'red';
            }
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
            this.ctx.restore();
        }
        if (showExceptions && this.hasExceptions) {
            this.ctx.save();
            this.ctx.fillStyle = '#F00';
            this.ctx.fillRect(this.x, this.y, ACDC.exceptionMarker.width, ACDC.exceptionMarker.height);
            this.ctx.restore();
        }
    }
};

