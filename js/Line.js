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
};

ACDC.Line.prototype = {

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
        this.ctx.stroke();
        this.ctx.restore();
    }
};

