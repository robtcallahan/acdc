Ext.namespace('ACDC');

ACDC.Placeholder = function(config) {
    this.objectType = 'placeholder';

    this.id = 0;
    this.locationId = null;
    this.text = '';
    this.ctId = null;
    this.ctType = null;
    this.image = null;
    this.ctImageName = null;
    this.imageLoaded = false;
    this.ctLength = null;
    this.ctWidth = null;
    this.x = null;
    this.y = null;
    this.rotation = 0;

    Ext.apply(this, config);

    this.textColor = "black";
    //this.font = "normal 12px Calibri";
    this.font = "normal 9px Arial Narrow";

    this.width = this.image.naturalWidth;
    this.height = this.image.naturalHeight;

    this.x = config.x;
    this.y = config.y;

    // define the upper-left and lower-right coordinates
    this.x1 = this.x;
    this.x2 = this.x1 + this.width;
    this.y1 = this.y;
    this.y2 = this.y1 + this.height;

    // offset keeps track of where the mouse was click to select the rack
    this.selectX = null;
    this.selectY = null;

    // define the mid section for purposes of rectangle selection
    this.midX = this.x + this.width / 2;
    this.midY = this.y + this.height / 2;

    this.selected = false;     // keep track of selected cabinets
};

ACDC.Placeholder.prototype = {

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
            url:        'php/save_cabinet.php',
            params:     {
                id:     this.id,
                action: "delete"
            },
            scope: this,
            mycallback: function(json, options) {
                if (cb) cb().apply(cbScope);
            }
        });
    },

    save: function(cb, cbScope) {
        Ext.Ajax.request({
            url:        'php/save_cabinet.php',
            params:     {
                id:           this.id,
                name:         this.name,
                ctId:         this.ctId,
                locationId:   this.locationId,
                x:            this.x,
                y:            this.y,
                action:       "save"
            },
            scope: this,
            mycallback: function(json, options) {
                this.id = json.cabinet.id;
                if (cb) cb().apply(cbScope);
            }
        });
    },

    select: function() {
        if (this.debug > 2) console.log("Placeholder::select(): name=" + this.name);
        this.selected = true;
    },

    unselect: function() {
        if (this.debug > 2) console.log("Placeholder::unselect(): name=" + this.name);
        this.selected = false;
    },

    isSelected: function() {
        return this.selected;
    },

    draw: function() {
        if (this.debug > 2) console.log("Placeholder::draw(" + this.text + ")");

        var TO_RADIANS = Math.PI/180,
            txtOffset = this.text.length * 6,
            x, y;

        this.ctx.font = this.font;

        // draw the placeholder image
        if (this.rotation != 0) {
            this.ctx.save();
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(this.rotation * TO_RADIANS);
            this.ctx.drawImage(this.image, 0, 0);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        // draw the text if not empty
        if (this.text != "") {
            this.ctx.save();
            this.ctx.font = "normal 11px Arial Narrow";
            if (parseInt(this.rotation) !== 0) {
                x = this.x + (this.height/2) - (txtOffset/2);
                y = this.y - this.width/2 + 4;
                this.ctx.fillText(this.text, x, y);
            } else if (this.ctImageName.search(/column/) !== -1) {
                x = this.x + (this.width/2) - (txtOffset/2);
                y = this.y + this.height/2 + 4;
                this.ctx.fillText(this.text, x, y);
            } else {
                this.ctx.translate(this.x, this.y);
                this.ctx.rotate(-90 * TO_RADIANS);
                x = -parseInt(this.ctLength/2) - txtOffset/2;
                y = parseInt(this.ctWidth/2) + 5;
                this.ctx.fillText(this.text, x, y);
            }
            this.ctx.restore();
        }
    }
};

