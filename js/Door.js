Ext.namespace('ACDC');

ACDC.Door = function(config) {
    this.ctx = null;
    this.objectType = 'door';

    this.tileSize = 24;

    this.id = 0;
    this.locationId = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 1;
    this.startAngle = 0;
    this.clockwise = 1;

    this.color = "black";
    this.width = 1.0;

    this.debug = 0;

    Ext.apply(this, config);
};

ACDC.Door.prototype = {
    draw: function() {
        if (this.debug > 2) console.log("Door::draw()");

        var TO_RADIANS = Math.PI/180,
            counterClockwise = !this.clockwise,
            endAngle,
            x2, y2;

        // 15.5, 2, 14.5, 3

        // draw the line representing the door
        if (this.startAngle == 0 && this.clockwise) {
            x2 = this.centerX + 1;
            y2 = this.centerY + 1;
            endAngle = 90 * TO_RADIANS;
        } else if (this.startAngle == 0 && !this.clockwise) {
            x2 = this.centerX + 1;
            y2 = this.centerY - 1;
            endAngle = 90 * TO_RADIANS * -1;
        } else if (this.startAngle == 180 && this.clockwise) {
            x2 = this.centerX - 1;
            y2 = this.centerY - 1;
            endAngle = 270 * TO_RADIANS;
        } else if (this.startAngle == 180 && !this.clockwise) {
            x2 = this.centerX - 1;
            y2 = this.centerY + 1;
            endAngle = 90 * TO_RADIANS;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.lineCap = this.cap;

        this.ctx.moveTo(this.centerX * this.tileSize, this.centerY * this.tileSize);
        this.ctx.lineTo(x2 * this.tileSize, y2 * this.tileSize);

        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();

        // draw the arc
        this.ctx.save();
        this.ctx.beginPath();

        this.ctx.strokeStyle = 1;
        this.ctx.lineWidth = 1;

        this.ctx.arc(
            this.centerX * this.tileSize,
            this.centerY * this.tileSize,
            this.radius * this.tileSize,
            this.startAngle * TO_RADIANS,
            endAngle,
            counterClockwise);

        this.ctx.stroke();
        this.ctx.restore();

    }
};

