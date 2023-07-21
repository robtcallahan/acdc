Ext.namespace('ACDC');


var Cabinet = fabric.util.createClass(fabric.Image, {

    type: 'cabinet',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', 'cabinet');
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);
        this.set('label', options.label || '');
        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        this.set('hasPower', typeof options.hasPower !== "undefined" ? options.hasPower : true);
        this.set('hasExceptions', typeof options.hasExceptions !== "undefined" ? options.hasExceptions : false);
        this.set('utilStatus', options.utilStatus || ACDC.CABINETUTILOK);
        this.set('numRUsUsed', options.numRUsUsed || 0);
        this.set('numAssets', options.numAssets || 0);

        this.set('showExceptions', options.showExceptions || false);
        this.set('selected', options.selected || false);
        this.set('highlighted', options.highlighted || false)

        this.set('assocPlaceholder', null);

        // configuration properties

        // When set to `false`, an object can not be selected for modification (using either point-click-based or group-based selection). But events still fire on it.
        // Default value: true
        this.set('selectable', options.selectable || true);

        // When set to `false`, object's controls are not displayed and can not be used to manipulate object
        // Default value: true
        this.set('hasControls', options.hasControls || true);

        // When set to `false`, object's controlling rotating point will not be visible or selectable
        // Default value: true
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);

        // When `true`, object horizontal scaling is locked
        // Default value: false
        this.set('lockScalingX', options.lockScalingX || true);

        // When `true`, object vertical scaling is locked
        // Default value: false
        this.set('lockScalingY', options.lockScalingY || true);

        // When `true`, object non-uniform scaling is locked
        // Default value: false
        this.set('lockUniScaling', options.lockUniScaling || true);

        // Scale factor of object's controlling borders
        // Default value: 1
        this.set('borderScaleFactor', options.borderScaleFactor || 1);

        // Color of controlling borders of an object (when it's active)
        // Default Value: "rgba(102,153,255,0.75)"
        this.set('borderColor', options.borderColor || "#0000FF");

        // Color of controlling corners of an object (when it's active)
        // Default Value: "rgba(102,153,255,0.5)"
        this.set('cornerColor', options.cornerColor || "#0000FF");

        // Size of object's controlling corners (in pixels)
        // Default value: 12
        this.set('cornerSize', options.cornerSize || 12);

        // Opacity of object's controlling borders when object is active and moving
        // Default Value: 0.4
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);

        // When set to `false`, object's controlling borders are not rendered
        // Default value: true
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            label: this.get('label'),
            height: this.get('height'),
            width: this.get('width'),
            hasPower: this.get('hasPower'),
            hasExceptions: this.get('hasExceptions'),
            utilStatus: this.get('utilStatus'),
            numRUsUsed: this.get('numRUsUsed'),
            numAssets: this.get('numAssets'),
            selected: this.get('selected'),
            highlighted: this.get('highlighted')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        var txtOffset;
        var TO_RADIANS = Math.PI/180;

        // draw the power indicator
        ctx.fillStyle = this.hasPower ? '#0F0' : '#F00';
        ctx.fillRect(this.width/2 - 5, -this.height/2, 5, 5);

        // draw the label
        ctx.fillStyle = '#000';
        if (this.get('angle') !== 0) {
            ctx.font = "11px Arial";

            ctx.rotate(90 * Math.PI / 180);
            ctx.fillText(this.label, -(this.height / 2) + 5, 4);
        } else {
            ctx.font = "11px Arial";

            txtOffset = this.label.length * 5;

            ctx.rotate(-90 * Math.PI / 180);
            ctx.fillText(this.label, -(this.height / 2) + (txtOffset / 2), 4);
        }

        // show exceptions
        if (this.get('showExceptions') && this.hasExceptions) {
            ctx.fillStyle = '#F00';
            //ctx.fillRect(-(this.width/2) + 5, this.height/2, 10, -10);
            ctx.fillRect(this.width/2 - 5, -this.height/2 + 5, 10, 10);
        }

        // show the capacity color key
        if (this.get('utilStatus') === ACDC.CABINETUTILFULL) {
            ctx.fillStyle = 'red';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.height/2, this.width/2, -this.height, -this.width);
        } else if (this.get('utilStatus') === ACDC.CABINETUTILEMPTY) {
            ctx.fillStyle = 'green';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.height/2, this.width/2, -this.height, -this.width);
        }

        // color yellow if selected
        if (this.get('selected')) {
            ctx.fillStyle = 'yellow';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.height/2, this.width/2, -this.height, -this.width);
        }

        // color yellow if selected
        if (this.get('highlighted')) {
            ctx.fillStyle = 'blue';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.height/2, this.width/2, -this.height, -this.width);
        }
    }
});

var Placeholder = fabric.util.createClass(fabric.Image, {

    type: 'placeholder',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('label', options.label || '');
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('tileX', options.tileX || 0);
        this.set('tileY', options.tileY || 0);

        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        this.set('assocCabinet', null);

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);
        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            label: this.get('label'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        var txtOffset;

        if (this.label) {
            // check to see if the associated cabinet is over the placeholder.
            // if so, do not show the label so there is no occlusion
            if (this.get('assocCabinet') !== null) {
                var assocCabinet = this.get('assocCabinet');
                var cabinetCenterPoint = assocCabinet.getCenterPoint();

                //console.log(this.get('left') + ", " + (this.get('left') + this.get('width')) + ", " +
                //this.get('top') + ", " + (this.get('top') + this.get('height')))

                if (cabinetCenterPoint.x > this.get('left') && cabinetCenterPoint.x < this.get('left') + this.get('width') &&
                cabinetCenterPoint.y > this.get('top') && cabinetCenterPoint.y < this.get('top') + this.get('height')) {
                    return;
                }
            }

            ctx.fillStyle = '#000';

            if (this.get('angle') !== 0) {
                ctx.font = "11px Arial";

                ctx.rotate(90 * Math.PI / 180);
                ctx.fillText(this.label, -(this.height / 2) + 5, 4);
            } else {
                ctx.font = "11px Arial";

                txtOffset = this.label.length * 5;

                ctx.rotate(-90 * Math.PI / 180);
                ctx.fillText(this.label, -(this.height / 2) + (txtOffset / 2), 4);
            }
        }
    }
});

var PerfTile = fabric.util.createClass(fabric.Image, {

    type: 'perf_tile',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('tileX', options.tileX || 0);
        this.set('tileY', options.tileY || 0);

        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);
        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

var PDU = fabric.util.createClass(fabric.Image, {

    type: 'pdu',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('tileX', options.tileX || 0);
        this.set('tileY', options.tileY || 0);

        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);

        this.set('hasRotatingPoint', options.hasRotatingPoint || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);

        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.fillStyle = '#000';
        ctx.font = "10px Arial";
        ctx.fillText("PDU", -(this.width / 2) + 1, 0);
    }
});

var CRAC = fabric.util.createClass(fabric.Image, {

    type: 'crac',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('tileX', options.tileX || 0);
        this.set('tileY', options.tileY || 0);

        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);

        this.set('hasRotatingPoint', options.hasRotatingPoint || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);

        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.fillStyle = '#000';
        ctx.font = "10px Arial";
        ctx.fillText("CRAC", -10, 0);
    }
});

var Column = fabric.util.createClass(fabric.Image, {

    type: 'column',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('tileX', options.tileX || 0);
        this.set('tileY', options.tileY || 0);

        this.set('height', options.height || 48);
        this.set('width', options.width || 24);

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);
        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            objectType: this.get('objectType'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

var Label = fabric.util.createClass(fabric.IText, {

    type: 'label',

    initialize: function(element, options) {
        options || (options = { });

        this.callSuper('initialize', element, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);

        // add to monitor changes
        this.set('stateProperties', ['text', 'top', 'left']);

        // configuration properties

        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockUniScaling', options.lockUniScaling || true);
        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

var Line = fabric.util.createClass(fabric.Line, {

    type: 'line',

    initialize: function(points, options) {
        options || (options = { });

        this.callSuper('initialize', points, options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);

        // configuration properties
        this.set('stroke', 'black');
        this.set('strokeLineCap', 'butt');
        this.set('strokeWidth', 3.0);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('padding', options.padding || 12);

        this.set('hasRotatingPoint', options.hasRotatingPoint || true);
        this.set('lockScalingX', options.lockScalingX || false);
        this.set('lockScalingY', options.lockScalingY || false);
        this.set('lockUniScaling', options.lockUniScaling || false);

        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

var Generic = fabric.util.createClass(fabric.Rect, {

    type: 'generic',

    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize', options);

        // NeuStar properties
        this.set('type', this.type);
        this.set('objectType', this.type);
        this.set('id', options.id || 0);
        this.set('locationId', options.locationId || 0);
        this.set('cabinetTypeId', options.cabinetTypeId || 0);

        this.set('height', options.height || 24);
        this.set('width', options.width || 24);

        this.set('fill', "transparent");
        this.set('stroke', "black");

        // configuration properties

        this.set('selectable', options.selectable || true);
        this.set('hasControls', options.hasControls || true);

        this.set('hasRotatingPoint', options.hasRotatingPoint || true);
        this.set('lockScalingX', options.lockScalingX || false);
        this.set('lockScalingY', options.lockScalingY || false);
        this.set('lockUniScaling', options.lockUniScaling || false);

        this.set('borderScaleFactor', options.borderScaleFactor || 1);
        this.set('borderColor', options.borderColor || "#0000FF");
        this.set('cornerColor', options.cornerColor || "#0000FF");
        this.set('cornerSize', options.cornerSize || 12);
        this.set('borderOpacityWhenMoving', options.borderOpacityWhenMoving || 0.5);
        this.set('hasBorders', options.hasBorders || true);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            locationId: this.get('locationId'),
            cabinetTypeId: this.get('cabinetTypeId'),
            tileX: this.get('tileX'),
            tileY: this.get('tileY'),
            height: this.get('height'),
            width: this.get('width')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

var LabeledRect = function(canvas) {
        var box = new Box({
            left: 48,
            top: 48
        });

        var label = new Label("XXX", {
            left: 50,
            top: 50
        });

        canvas.add(box);
        canvas.add(label);

        var group = new fabric.Group({});

        group.addWithUpdate(box);
        group.addWithUpdate(label);
        canvas.add(group);
};
