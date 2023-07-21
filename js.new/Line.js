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

ACDC.Line = function(config) {
    this.ctx = null;
    this.objectType = 'line';

    this.id = 0;
    this.locationId = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.color = "black";
    this.width = 3.0;
    this.cap = 'butt';

    this.debug = 0;

    Ext.apply(this, config);

    // offset keeps track of where the mouse was clicked to select the line
    this.selectX = null;
    this.selectY = null;

    // keep track of which end was selected for stretching
    this.stretchEnd = false;

    this.selected = false;
    this.highlighted = false;
};

ACDC.Line.prototype = {

    getObjectType: function() {
        return this.objectType;
    },

    setId: function(id) {
        this.id = id;
    },

    getId: function() {
        return this.id;
    },

    setX1: function(x) {
        this.x1 = parseInt(x);
    },

    setName: function(name) {
        this.name = name;
    },

    getName: function() {
        return this.name;
    },

    setY1: function(y) {
        this.y1 = parseInt(y);
    },

    getX1: function() {
        return this.x1;
    },

    getY1: function() {
        return this.y1;
    },

    setX2: function(x) {
        this.x2 = parseInt(x);
    },

    setY2: function(y) {
        this.y2 = parseInt(y);
    },

    getX2: function() {
        return this.x2;
    },

    getY2: function() {
        return this.y2;
    },

    select: function() {
        this.selected = true;
    },

    unselect: function() {
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

    save: function(cb, cbScope) {
        Ext.Ajax.request({
            url: 'php/save_line.php',
            params: {
                id: this.id,
                locationId: this.locationId,
                x1: this.x1,
                y1: this.y1,
                x2: this.x2,
                y2: this.y2,
                color: this.color,
                width: this.width,
                cap: this.cap,
                action: "save"
            },
            scope: this,
            mycallback: function(json, options) {
                this.id = json.line.id;
                if (cb) cb.apply(cbScope);
            }
        });
    },

    remove: function(cb, cbScope) {
        Ext.Ajax.request({
            url: 'php/save_line.php',
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

    /**
     * Determine the mouse is over a line. To make this work better, we're going to draw a rectangle
     * around the line and then use the isPointInPath() method
     * @param m
     * @returns {boolean}
     */
    contains: function(m) {
        var line, end1, end2;

        // width of the rectangle
        var width = 10;
        // angle of a line in radians
        var aRadians = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
        // distance between 2 points. ref: http://www.mathsisfun.com/algebra/distance-2-points.html
        var length = Math.sqrt(Math.pow(this.x1 - this.x2, 2) + Math.pow(this.y1 - this.y2, 2));

        this.ctx.save();
        this.ctx.beginPath();
        // move the canvas origin to the first point
        this.ctx.translate(this.x1, this.y1);
        // rotate by the calculated angle
        this.ctx.rotate(aRadians);
        // draw our rectangle around the line
        this.ctx.rect(0, -5, length, 10);
        this.ctx.closePath();
        this.ctx.restore();
        // check if mouse is in this rectangle
        line = this.ctx.isPointInPath(m.x, m.y);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.x1 - 5, this.y1 - 5, 10, 10);
        this.ctx.closePath();
        end1 = this.ctx.isPointInPath(m.x, m.y);

        this.ctx.beginPath();
        this.ctx.rect(this.x2 - 5, this.y2 - 5, 10, 10);
        this.ctx.closePath();
        end2 = this.ctx.isPointInPath(m.x, m.y);

        this.ctx.restore();

        if (end1) {
            this.stretchEnd = 1;
        } else if (end2) {
            this.stretchEnd = 2;
        } else {
            this.stretchEnd = false;
        }
        return line || end1 || end2;
    },

    moveTo: function(x, y) {
        this.x2 = parseInt(this.x2) - parseInt(this.x1) + parseInt(x);
        this.y2 = parseInt(this.y2) - parseInt(this.y1) + parseInt(y);
        this.x1 = x;
        this.y1 = y;
        if (this.debug > 2) console.log("Line::moveTo(): (" + this.x1 + "," + this.y1 + ") (" + this.x2 + "," + this.y2 + ")");
    },

    stretchTo: function(x, y) {
        if (this.stretchEnd === 1) {
            this.x1 = x;
            this.y1 = y;
        } else if (this.stretchEnd === 2) {
            this.x2 = x;
            this.y2 = y;
        }
    },

    draw: function() {
        if (this.debug > 2) console.log("Line::draw()");
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.lineCap = this.cap;

        this.ctx.moveTo(this.x1, this.y1);
        this.ctx.lineTo(this.x2, this.y2);
        this.ctx.closePath();
        //if (this.debug) console.log("line draw(" + this.x1 + "," + this.y1 + "," + this.x2 + "," + this.y2 + ")");
        this.ctx.stroke();
        this.ctx.restore();

        if (this.isHighlighted()) {
            if (this.debug > 2) console.log("Line::draw(): HIGHLIGHTED");
            this.ctx.save();
            this.ctx.strokeStyle = '#9999FF';
            this.ctx.width = 2.0;
            this.ctx.fillStyle = '#9999FF';
            this.ctx.fillRect(this.x1 - 5, this.y1 - 5, 10, 10);
            this.ctx.fillRect(this.x2 - 5, this.y2 - 5, 10, 10);
            this.ctx.restore();
        }

        if (this.isSelected()) {
            if (this.debug > 2) console.log("Line::draw(): SELECTED");
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#9999FF';
            this.ctx.width = 2.0;
            this.ctx.fillStyle = '#9999FF';
            this.ctx.fillRect(this.x1 - 5, this.y1 - 5, 10, 10);
            this.ctx.fillRect(this.x2 - 5, this.y2 - 5, 10, 10);
            this.ctx.restore();
        }
    }
};

