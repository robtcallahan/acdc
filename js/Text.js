Ext.namespace('ACDC');

ACDC.Text = function(config) {
    this.ctx = null;
    this.objectType = 'text';

    this.id = 0;
    this.locationId = 0;
    this.string = '';
    this.font = 'bold 12pt Calibri';
    this.color = 'black';
    this.x = 0;
    this.y = 0;
    this.rotation = 0;

    Ext.apply(this, config);
};

ACDC.Text.prototype = {

    getObjectType: function() {
        return this.objectType;
    },

    setId: function(id) {
        this.id = id;
    },

    getId: function() {
        return this.id;
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

    draw: function() {
        if (this.debug > 2) console.log("Text::draw()");

        this.ctx.save();
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.string, this.x, this.y);
        this.ctx.restore();
    }

    /*
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
    */

    /**
     * Determine the mouse is over a line. To make this work better, we're going to draw a rectangle
     * around the line and then use the isPointInPath() method
     * @param m
     * @returns {boolean}
     */
    /*
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
    */
};

