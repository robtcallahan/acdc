/*******************************************************************************
 *
 * $Id: DCLayout.js 82190 2013-12-20 17:05:05Z rcallaha $
 * $Date: 2013-12-20 12:05:05 -0500 (Fri, 20 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 82190 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/DCLayout.js $
 *
 *******************************************************************************
 */

Ext.override(Ext.Panel, {
    syncHeight: function() {
        //noinspection JSUnresolvedVariable
        if (!(this.autoHeight || this.duringLayout)) {
            var last = this.lastSize;
            if (last && !Ext.isEmpty(last.height)) {
                var old = last.height, h = this.el.getHeight();
                if (old != 'auto' && old != h) {
                    var bd = this.body, bdh = bd.getHeight();
                    h = Math.max(bdh + old - h, 0);
                    if (bdh != h) {
                        bd.setHeight(h);
                        var sz = bd.getSize();
                        this.fireEvent('bodyresize', sz.width, sz.height);
                    }
                }
            }
        }
    }
});

Ext.namespace('ACDC');

ACDC.DCLayout = Ext.extend(Ext.Panel, {

    /** for testing purposes */
    //onLoadTileLocation: "05G",
    onLoadTileLocation: "",

    /*
    imageSrcs:         {},
    images:            {},

    // array of lines and text
    lines:             [],
    doors:             [],
    text:              [],
    placeholders:      [],

    // array of cabinets
    cabinets:          [],
    numCabinetsGotten: 0,
    */

    // options
    tileSize:          24,
    debug:             ACDC.debug,
    grid:              true,
    snap:              true,
    gridSpacing:       {
        1: 6,
        2: 12,
        3: 24,
        4: 48,
        5: 96
    },
    gridSpacingOpt:    3,
    spacing:           null,
    labelSnap:         4,

    defaultFont:       'Calibri',
    defaultFontSize:   18,
    defaultFontWeight: 'bold',

    // highlighted cabs
    highlightedCabinets:  [],

    /*
    selectRegion: {
        x:       null,
        y:       null,
        width:   null,
        height:  null,
        offsetX: null,
        offsetY: null
    },

    // location of mouse down on group drag
    grabX:        null,
    grabY:        null,

    selecting:          false,
    dragging:           false,
    groupDrag:          false,
    showDetailsOnClick: true,
    */

    defaultHeight: 2000,
    defaultWidth: 2000,
    scale: 1.25,

    layoutLoaded: false,

    initComponent: function() {
        Ext.apply(this, arguments);

        this.addEvents(
            'showcabinetelevation',
            'onlocationselect',
            'sendfeedback',
            'showusers',
            'installasset',
            'addasset',
            'switchtab'
        );

        this.canvas = {};

        this.currentLocationId = 1;    // Sterling
        //this.currentLocationId = 14; // Denver
        //this.currentLocationId = 3;  // CLT-3

        this.location = {
            id: 3,
            name: 'Location'
        };

        this.cabinetsHashById = [];
        this.cabinetsHashByLabel = [];
        this.placeholdersHashByLabel = [];

        this.showUtilization = false;
        this.showExceptions = false;
        this.cabinetSelected = false;


        this.editableByUser = this.actor.accessCode === 1 || this.actor.accessCode === 3;

        this.cabinetTypesStore = new Ext.data.Store({
            baseParams: {
                view: this.view
            },
            proxy:      new Ext.data.HttpProxy({
                url:        'php/get_cabinet_types.php',
                mycallback: function () {
                }
            }),
            reader:     new Ext.data.JsonReader({
                root:          'cabinetTypes',
                totalProperty: 'total'
            }, [
                {name: 'id', type: 'int'},
                {name: 'name', type: 'string'},
                {name: 'type', type: 'string'},
                {name: 'imageName', type: 'string'},
                {name: 'length', type: 'int'},
                {name: 'width', type: 'int'}
            ])
        });

        Ext.apply(this, {
            margins: '0 0 0 0',
            tbar:    this.toolbar,
            bufferResize: 5000,
            html: '<div id="canvas-div" class="canvas-div"><canvas id="canvas-id" class="canvas"></canvas></div>'
            //html: '<canvas id="canvas-id" class="canvas"></canvas>'
        });

        ACDC.DCLayout.superclass.initComponent.apply(this, arguments);

        // create a DOM element that will be use for tooltips
        // the tooltip will be used on the red boxes in the upper left of the cabinets
        // to display asset exceptions
        /*
        Ext.DomHelper.append(
            document.body,
            {
                id:  'my-tooltip',
                tag: 'div',
                cls: 'cab-tooltip'
            }
        );
        this.toolTipEl = Ext.get('my-tooltip');
        this.toolTipEl.displayed = false;
        this.toolTipEl.cabId = null;
        this.cursorOnToolTip = false;
        this.toolTipEl.on('mouseover', this.onToolTipMouseOver, this);
        this.toolTipEl.on('mouseout', this.onToolTipMouseOut, this);
        */
    },

    afterRender: function() {
        if (this.debug) console.log("DCLayout::afterRender()");
        this.loadMask = new Ext.LoadMask(this.bwrap, {});
        this.initializeLayout();
    },

    /**
     * **********************************************************************************
     * Canvas setup and population methods
     * **********************************************************************************
     */

    initializeLayout: function() {
        this.spacing = this.gridSpacing[this.gridSpacingOpt];

        this.createCanvas();
        this.getObjects();
    },

    createCanvas: function() {
        if (this.debug) console.log("createCanvas()");

        this.canvas = new fabric.Canvas('canvas-id', {
                containerClass: "canvas-div",
                selectionLineWidth: 3
        });
        this.canvas.setHeight(2000);
        this.canvas.setWidth(2000);
        this.canvas.setBackgroundColor('rgb(242,246,246)');
        this.canvas.setZoom(this.scale);

        this.addCanvasListeners();
    },

    /**
     * this.getCabinets() is called in this.createPlaceholders() which is called
     * after the AJAX call in this.getPlaceholders(). This it to insure that placeholders
     * are always added before cabinets as they need to go on the bottom
     */
    getObjects: function(cabinetId, assetId) {
        this.canvas.clear();
        this.addGrid();
        this.addTitle();
        this.getPlaceholders(cabinetId, assetId);
        this.getLines();
        this.getText();
    },

    addCanvasListeners: function() {
        // setup the event listeners
        var self = this;
        this.canvas.on('mouse:down', function(options) {
            self.onMouseDown(options, self);
        });
        this.canvas.on('mouse:up', function(options) {
            self.onMouseUp(options, self);
        });
        this.canvas.on('text:editing:exited', function(options) {
            self.textChanged(options, self)
        });
    },


    /**
     * **********************************************************************************
     * Changes
     * **********************************************************************************
     */
    textChanged: function(options, scope) {
        if (options.target) {
            var target = options.target;

            //console.log('text:editing:exited on ' + target.type);
            //console.log(target.originalState.text + " -> " + target.text);
            if (target.originalState.text !== target.text) {
                scope.saveObject(target, "save");
            }
        }
    },

    locationChange: function() {
        this.canvas.clear();
        this.getObjects();
    },

    /**
     * **********************************************************************************
     * Mouse functions
     * **********************************************************************************
     */
    onMouseDown: function(options, scope) {
        if (options.target) {
            var target = options.target;

            //console.log('mouse:down on ' + target.type + ". Saving state");
            target.saveState();
        }
    },

    snapToGrid: function(value) {
        return Math.round(value / this.spacing) * this.spacing;
    },

    onMouseUp: function(options, scope) {
        var saveFlag = false,
            leftPrev, topPrev,
            left, top;

        if (options.e.button === 2) {
            // right mouse button. show context menu
            if (options.target) {
                this.showContextMenu(options, scope);
            }
            return

        }

        // we moved an object
        if (options.target) {
            // it was a cabinet
            var target = options.target;

            // Cabinet
            if (target.isType('cabinet')) {
                var cab = options.target;
                //console.log('mouse:up on ' + cab.type + ': ' + cab.label);

                if (cab.hasStateChanged()) {
                    leftPrev = cab.originalState.left;
                    topPrev = cab.originalState.top;

                    if (leftPrev !== cab.left || topPrev !== cab.top) {
                        // snap to grid
                        left = Math.round(cab.left / scope.spacing) * scope.spacing;
                        top = Math.round(cab.top / scope.spacing) * scope.spacing;

                        cab.setLeft(left);
                        cab.setTop(top);
                        scope.canvas.renderAll(true);
                        saveFlag = true;
                    }
                } else {
                    if (target.isType('cabinet')) {
                        // we clicked on the cabinet. Let's show the cabinet elevation
                        scope.selectCabinet(cab);
                        scope.cabinetSelected = true;
                    }
                }
            }

            // Placeholder, PerfTile, RPP & Column
            else if (target.isType('placeholder') || target.isType('perf_tile') || target.isType('crac')
                || target.isType('pdu') || target.isType('column') || target.isType('generic')) {
                if (target.hasStateChanged()) {
                    target.setLeft(Math.round(target.left / scope.spacing) * scope.spacing);
                    target.setTop(Math.round(target.top / scope.spacing) * scope.spacing);
                    target.set('scaleX', Math.round(target.scaleX));
                    target.set('scaleY', Math.round(target.scaleY));

                    target.set('angle', Math.round(target.angle / 90) * 90);
                    scope.canvas.renderAll(true);
                    saveFlag = true;
                }
            }

            // Line
            else if (target.isType('line')) {
                var line = options.target;
                //console.log('mouse:up on line');

                if (line.hasStateChanged()) {
                    target.set('top', scope.snapToGrid(line.top));
                    target.set('left', scope.snapToGrid(line.left));
                    target.set('scaleX', Math.round(line.scaleX));
                    target.set('scaleY', Math.round(line.scaleY));
                    target.set('width', scope.snapToGrid(line.width));
                    target.set('height', scope.snapToGrid(line.height));
                    target.set('angle', Math.round(line.angle / 45) * 45);

                    console.log(target.toObject());

                    // hey, we moved!
                    //console.log("line has moved");
                    scope.canvas.renderAll(true);
                    saveFlag = true;
                }
            }

            // Label
            else if (target.isType('label')) {
                var label = options.target;
                //console.log('mouse:up on label');

                if (label.hasStateChanged()) {
                    leftPrev = target.originalState.left;
                    topPrev = target.originalState.top;

                    if (leftPrev !== target.left || topPrev !== target.top ||
                        target.originalState.text !== target.text) {

                        //console.log(leftPrev + "," + topPrev + " -> " + target.left + "," + target.top);

                        left = Math.round(target.left / scope.labelSnap) * scope.labelSnap;
                        top = Math.round(target.top / scope.labelSnap) * scope.labelSnap;
                        target.setLeft(left);
                        target.setTop(top);
                        scope.canvas.renderAll(true);

                        saveFlag = true;
                    }
                }
            }

            // group
            /*
            else if (target.isType('group')) {
                leftPrev = target.originalState.left;
                topPrev = target.originalState.top;

                if (leftPrev !== target.left || topPrev !== target.top) {
                    var objects = target.getObjects(),
                        diffLeft = target.left - leftPrev,
                        diffTop = target.top - topPrev;

                    //console.log("Prev=" + leftPrev + "," + topPrev);
                    //console.log("Curr=" + target.left + "," + target.top);
                    //console.log("Diff=" + diffLeft + "," + diffTop);

                    for (var i=0; i<objects.length; i++) {
                        var o = objects[i],
                            origLeft, origTop;

                        // type property is not available in a group collection. Don't know why.
                        // So we defined a custom objectType property with the same value and we
                        // assign it to type here so that it can be passed to the server
                        o.type = o.objectType;

                        // save current top and left so we can put them back after save
                        origLeft = o.left;
                        origTop = o.top;

                        // add the group's left and top to object's since current object's left and
                        // and top are relative to group's center. Then round to grid points
                        o.left = Math.round((o.originalState.left + diffLeft) / scope.spacing) * scope.spacing;
                        o.top = Math.round((o.originalState.top + diffTop) / scope.spacing) * scope.spacing;
                        //console.log(o.left + "," + o.top);

                        this.saveObject(o, "save");

                        // restore top and left. The need to be offset values from group's center
                        // we only set to absolute values for the save. now we put them back
                        o.left = origLeft;
                        o.top = origTop;
                    }
                }
                saveFlag = false;
            }
            */

            if (saveFlag) {
                scope.saveObject(target, "save");
            }
        } else {
            if (scope.cabinetSelected) {
                scope.unselectAllCabinets();
                scope.cabinetSelected = false;
            }
        }
    },


    /**
     * **********************************************************************************
     * Retrieve and add all objects: cabinets, placeholders, etc.
     * **********************************************************************************
     */
    addTitle: function() {
        if (typeof this.parent.locationsHash !== "undefined" && typeof this.parent.locationsHash[this.currentLocationId] !== "undefined") {
            var title = this.parent.locationsHash[this.currentLocationId].name;

            var text = new fabric.IText(title, {
                left: 400,
                top: 25,

                // color not supported in text objects
                //color: rec.color,

                fontFamily: 'Calibri',
                fontSize: 20,
                fontWeight: 'bold',

                hasRotatingPoint: false,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                lockMovementX: true,
                lockMovementY: true,
                editable: false,
                borderScaleFactor: 1,
                borderColor: "#0000FF",
                cornerColor: "#0000FF",
                cornerSize: 12,
                borderOpacityWhenMoving: 0.5,
                hasBorders: true,
                hasControls: false
            });
            this.canvas.add(text);
        }
    },

    addGrid: function() {
        var i = 0, x, y, l,
            gridSpacing = this.gridSpacing[this.gridSpacingOpt];
        /* vertical lines */
        for (x = 0; x <= this.canvas.getWidth(); x += gridSpacing) {
            //console.log("adding vertical line at " + x);
            l = new fabric.Line([0.5 + x, 0, 0.5 + x, this.canvas.getHeight()], {
                padding: 1,
                selectable: false,
                stroke: 'rgb(170,187,204)'
            });
            this.canvas.add(l);
        }

        /* horizontal lines */
        for ( y = 0; y <= this.canvas.getHeight(); y += gridSpacing) {
            //console.log("adding horizontal line at " + y);
            l = new fabric.Line([0, 0.5 + y, this.canvas.getWidth(), 0.5 + y], {
                padding: 1,
                selectable: false,
                stroke: 'rgb(170,187,204)'
            });
            this.canvas.add(l);
        }
    },


    /* Cabinets */
    getCabinets: function(cabinetId, assetId) {
        if (this.debug) console.log("DCLayout::getCabinets()");

        this.layoutLoaded = false;
        this.cabinets = [];

        Ext.Ajax.request({
            url:        'php/get_cabinets.php',
            params:     {
                locationId: this.currentLocationId
            },
            scope:      this,
            mycallback: function (json, options) {
                this.location = json.location;
                this.createCabinets(json.cabinets, cabinetId, assetId);
            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createCabinets: function(cabinets, cabinetId, assetId) {
        if (this.debug) console.log("DCLayout::createCabinets()");

        var rec, iName, cabinet, newCabinet;

        this.cabinets = [];

        for (var i = 0; i < cabinets.length; i++) {
            rec = cabinets[i];
            iName = rec.ctImageName;

            if (this.debug > 2) console.log("DCLayout::createCabinets(): i: " + i + ", name: " + rec.name + ", image: " + iName);
            newCabinet = this.addCabinet(rec);
            this.cabinetsHashById[newCabinet.get('id')] = newCabinet;
            this.cabinetsHashByLabel[newCabinet.get('label')] = newCabinet;
        }
        if (cabinetId) {
            cabinet = this.cabinetsHashById[cabinetId];
            this.selectCabinet(cabinet);
            this.getCabinetElevation(cabinet, assetId);
        }
        this.canvas.renderAll();
    },

    /**
     * Takes the rec object passed and uses the values to create a fabric Image and adds to the canvas
     * This method has many of the most common options defined for convenience
     * Reference: http://fabricjs.com/docs/fabric.Image.html
     *
     * @param rec
     */
    addCabinet: function(rec) {
        //if (this.debug) console.log("DCLayout::addCabinet(): name: " + rec.name + ", image: " + rec.ctImageName);

        var assocPlaceholder;
        var imgId = parseInt(rec.ctId);
        var imgEl = document.getElementById('img-' + imgId);
        var cabinet = new Cabinet(imgEl, {

            id: parseInt(rec.id),
            label: rec.name,
            locationId: parseInt(rec.locationId),
            cabinetTypeId: parseInt(rec.ctId),

            // Left position of an object. Note that by default it's relative to object center. You can change this by setting originX={left/center/right}
            // Default value: 0
            left: parseInt(rec.x),

            // Top position of an object. Note that by default it's relative to object center. You can change this by setting originY={top/center/bottom}
            // Default value: 0
            top: parseInt(rec.y),

            // Angle of rotation of an object (in degrees)
            // Default value: 0
            angle: parseInt(rec.rotation),

            width: parseInt(rec.ctWidth),
            height: parseInt(rec.ctLength),

            hasPower: parseInt(rec.hasPower),
            hasExceptions: rec.hasExceptions,
            showExceptions: false,
            numAssets: rec.numAssets
        });

        if (typeof this.placeholdersHashByLabel[cabinet.get('label')] !== "undefined") {
            assocPlaceholder = this.placeholdersHashByLabel[cabinet.get('label')];
            cabinet.set('assocPlaceholder', assocPlaceholder);
            assocPlaceholder.set('assocCabinet', cabinet);
        }
        this.canvas.add(cabinet);
        return cabinet;
    },


    /* Lines */
    getLines: function() {
        if (this.debug) console.log("DCLayout::getLines()");

        Ext.Ajax.request({
            url: 'php/get_lines.php',
            params: {
                locationId: this.currentLocationId
            },
            scope: this,
            mycallback: function(json, options) {
                this.createLines(json.lines);
            },
            myerrorcallback: function(json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createLines: function(lines) {
        if (this.debug) console.log("DCLayout::createLines()");
        var i, l, line;

        this.lines = [];
        for (i = 0; i < lines.length; i++) {
            l = lines[i];
            line = new Line([
                /*
                parseFloat(l.x1) * this.tileSize,
                parseFloat(l.y1) * this.tileSize,
                parseFloat(l.x2) * this.tileSize,
                parseFloat(l.y2) * this.tileSize
                */
                parseFloat(l.x1),
                parseFloat(l.y1),
                parseFloat(l.x2),
                parseFloat(l.y2)
            ], {
                id: parseInt(l.id),
                locationId: parseInt(l.locationId),
                top: parseFloat(l.top),
                left: parseFloat(l.left),
                width: parseFloat(l.width),
                height: parseFloat(l.height),
                angle: parseFloat(l.angle),
                scaleX: parseFloat(l.scaleX),
                scaleY: parseFloat(l.scaleY),
                stroke: l.color,
                strokeLineCap: l.cap,
                strokeWidth: parseFloat(l.thickness)
            });
            this.canvas.add(line);
        }
    },


    /* Text */
    getText: function() {
        if (this.debug) console.log("DCLayout::getText()");

        Ext.Ajax.request({
            url: 'php/get_text.php',
            params: {
                locationId: this.currentLocationId
            },
            scope: this,
            mycallback: function(json, options) {
                this.createText(json.text);
            },
            myerrorcallback: function(json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createText: function(recs) {
        if (this.debug) console.log("DCLayout::createText()");

        for (var i = 0; i < recs.length; i++) {
            var rec = recs[i];
            var text = new Label(rec.string, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),

                left: parseInt(rec.x),
                top: parseInt(rec.y),
                angle: rec.rotation,

                // color not supported in text objects
                //color: rec.color,

                fontFamily: rec.fontFamily,
                fontSize: parseInt(rec.fontSize),
                fontWeight: rec.fontWeight
            });
            this.canvas.add(text);
        }

        /*
        for (i = 0; i < strings.length; i++) {
            s = strings[i];
            text = new ACDC.Text({
                ctx: this.canvasBufferCtx,
                debug: this.debug,
                id: parseInt(s.id),
                locationId: parseInt(s.locationId),
                string: s.string,
                font: s.font,
                color: s.color,
                x: s.x * this.tileSize,
                y: s.y * this.tileSize,
                rotation: s.rotation
            });
            this.text.push(text);
        }
        */
    },


    /* Placeholders */
    getPlaceholders: function(cabinetId, assetId) {
        if (this.debug) console.log("DCLayout::getPlaceholders()");

        Ext.Ajax.request({
            url:        'php/get_placeholders.php',
            params:     {
                locationId: this.currentLocationId
            },
            scope:      this,
            mycallback: function (json, options) {
                this.createPlaceholders(json.placeholders, cabinetId, assetId);
            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createPlaceholders: function(placeholders, cabinetId, assetId) {
        if (this.debug) console.log("DCLayout::createPlaceholders()");

        var rec, iName, placeholder;

        this.placeholders = [];
        for (var i = 0; i < placeholders.length; i++) {
            rec = placeholders[i];
            iName = rec.ctImageName;

            if (this.debug > 2) console.log("DCLayout::createPlaceholders(): i: " + i + ", image: " + iName);
            placeholder = this.addPlaceholder(rec);
            this.placeholders.push(placeholder);
            this.placeholdersHashByLabel[placeholder.get('label')] = placeholder;
        }
        this.getCabinets(cabinetId, assetId);
    },

    addPlaceholder: function(rec) {
        if (this.debug) console.log("DCLayout::addPlaceholder(): image: " + rec.ctImageName);

        var imgId = parseInt(rec.ctId);
        var imgEl = document.getElementById('img-' + imgId);

        if (rec.ctType === "placeholder") {
            var placeholder = new Placeholder(imgEl, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                label: rec.text,
                cabinetTypeId: parseInt(rec.ctId),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),
                angle: parseInt(rec.rotation),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength)
            });
            if (typeof this.cabinetsHashByLabel[placeholder.get('label')] !== "undefined") {
                placeholder.set('assocCabinet', this.cabinetsHashByLabel[placeholder.get('label')]);
            }
            this.canvas.add(placeholder);
            return placeholder;
        }
        else if (rec.ctType === "perf_tile") {
            var perfTile = new PerfTile(imgEl, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                cabinetTypeId: parseInt(rec.ctId),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength)
            });
            this.canvas.add(perfTile);
            return perfTile;
        }
        else if (rec.ctType === "pdu") {
            var pdu = new PDU(imgEl, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                cabinetTypeId: parseInt(rec.ctId),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength)
            });
            this.canvas.add(pdu);
            return pdu;
        }
        else if (rec.ctType === "crac") {
            var crac = new CRAC(imgEl, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                cabinetTypeId: parseInt(rec.ctId),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength),

                angle: parseInt(rec.rotation)
            });
            this.canvas.add(crac);
            return crac;
        }
        else if (rec.ctType === "column") {
            var column = new Column(imgEl, {
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                cabinetTypeId: parseInt(rec.ctId),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength)
            });
            this.canvas.add(column);
            return column;
        }
        else if (rec.ctType === "generic") {
            var generic = new Generic({
                id: parseInt(rec.id),
                locationId: parseInt(rec.locationId),
                cabinetTypeId: parseInt(rec.ctId),

                scaleX: parseInt(rec.scaleX),
                scaleY: parseInt(rec.scaleY),

                tileX: parseInt(rec.tileX),
                tileY: parseInt(rec.tileY),

                left: parseInt(rec.x),
                top: parseInt(rec.y),

                width: parseInt(rec.ctWidth),
                height: parseInt(rec.ctLength)
            });
            this.canvas.add(generic);
            return generic;
        }

        /*
        return new ACDC.Placeholder({
            debug: this.debug,
            id: rec.id,
            locationId: rec.locationId,
            text: rec.text,
            ctId: rec.ctId,
            ctType: rec.ctType,
            ctImageName: rec.ctImageName,
            ctLength: rec.ctLength,
            ctWidth: rec.ctWidth,
            image: this.images[rec.ctId].img,
            imageLoaded: true,
            x: rec.x * this.tileSize,
            y: rec.y * this.tileSize,
            rotation: rec.rotation,
            ctx: this.canvasBufferCtx,
            canvas: this.canvasBuffer,
            imagesDir: this.imagesDir
        });
        */
    },


    /**
     * **********************************************************************************
     * Save function
     * **********************************************************************************
     */

    saveObject: function(object, action) {
        if (object.isType('i-text')) {
            return;
        }

        var params = object.toObject();

        action = action ? action : "save";
        params.action = action;

        Ext.Ajax.request({
            url:        'php/save_object.php',
            params: JSON.stringify(params),
            scope: this,
            mycallback: function(json, options) {
                if (json.object && json.object.id) {
                    // set the object id in case this was a add/create so we have a new id
                    object.set('id', json.object.id);
                }
            }
        });
    },

    /**
     * **********************************************************************************
     *
     * **********************************************************************************
     */

    getCabinetElevation: function(cabinet, assetId) {
        this.fireEvent('showcabinetelevation', this, cabinet, assetId);
    },

    locationSelected: function(locationId) {
        console.log("locationSelected()");
        this.currentLocationId = locationId;

        // fire event to clear the cabinet details
        this.fireEvent('onlocationselect', this);
    },


    /**
     * **********************************************************************************
     *  Context-sensitive Menu
     * **********************************************************************************
     */
    showContextMenu: function(options, scope) {
        if (this.debug) console.log("DCLayout::showContextMenu()");

        var target = options.target,
            x = options.e.pageX,
            y = options.e.pageY;

        // define the contenxt senstive menu
        var menu = new Ext.menu.Menu({
            shadow: 'drop',
            items:  [
                {
                    text: 'Power',
                    scope: this,
                    hidden: target.isType('cabinet') ? false : true,
                    disabled: this.editableByUser ? false : true,
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                xtype: 'menucheckitem',
                                text: 'On',
                                id: 'menu-cabinet-power-on',
                                group: 'menu-cabinet-power',
                                handler: function() {
                                    target.set('hasPower', true);
                                    scope.canvas.renderAll(true);
                                    scope.saveObject(target);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            }, {
                                xtype: 'menucheckitem',
                                text: 'Off',
                                id: 'menu-cabinet-power-off',
                                group: 'menu-cabinet-power',
                                handler: function() {
                                    target.set('hasPower', false);
                                    scope.canvas.renderAll(true);
                                    scope.saveObject(target);
                                    (function() {
                                        menu.destroy();
                                    }).defer(500);
                                }
                            }
                        ]
                    }
                },
                '-',
                {
                    text:     'Delete',
                    scope:    this,
                    disabled: this.editableByUser ? false : true,
                    handler:  function () {
                        this.deleteObject(target);
                        (function() {
                            menu.destroy();
                        }).defer(500);
                    }
                },
                {
                    text:     'Rotate',
                    scope:    this,
                    disabled: this.editableByUser ? false : true,
                    handler:  function () {
                        this.rotateObject(target);
                        (function() {
                            menu.destroy();
                        }).defer(500);
                    }
                },
                '-',
                {
                    text:     'Edit Label',
                    disabled: this.editableByUser && (target.isType('cabinet') || target.isType('placeholder')) ? false : true,
                    scope:    this,
                    handler:  function () {
                        this.editLabel(target);
                        (function() {
                            menu.destroy();
                        }).defer(500);
                    }
                },
                {
                    text:     'Edit Cabinet Type',
                    disabled: this.editableByUser && target.isType('cabinet') ? false : true,
                    scope:    this,
                    handler:  function () {
                        this.cabinet = target;
                        this.editCabinetType();
                        (function() {
                            menu.destroy();
                        }).defer(500);
                    }
                }
            ]
        });

        menu.showAt([x + 10, y + 5]);

        if (target.isType('cabinet')) {
            if (target.get('hasPower')) {
                Ext.getCmp('menu-cabinet-power-on').setChecked(true);
                Ext.getCmp('menu-cabinet-power-off').setChecked(false);
            } else {
                Ext.getCmp('menu-cabinet-power-on').setChecked(false);
                Ext.getCmp('menu-cabinet-power-off').setChecked(true);
            }
        }
    },


    /**
     * **********************************************************************************
     * Edit labels and cabinet types
     * **********************************************************************************
     */
    editLabel: function(target) {
        if (this.debug) console.log("DCLayout::editLabel()");
        if (target.isType('cabinet')) {
            this.editCabinetLabel(target);
        } else if (target.isType('placeholder')) {
            this.editPlaceholderLabel(target);
        }
    },

    editPlaceholderLabel: function(placeholder) {
        if (this.debug) console.log("DCLayout::editPlaceholderLabel()");
        var found = false,
            objects = this.canvas.getObjects();

        Ext.Msg.prompt('Placeholder Name', 'Placeholder name:', function (btn, text) {
            if (btn == 'ok') {
                // check to be sure that this Placeholder doesn't already exist
                found = false;
                for (var i=0; i<objects.length; i++) {
                    if (objects[i].isType('placeholder') && objects[i].label === text) {
                        found = true;
                    }
                }
                if (found) {
                    Ext.Msg.alert("Edit Placeholder Name", "Placeholder " + text + " already exists. Please choose a different name.");
                } else {
                    placeholder.label = text;
                    this.saveObject(placeholder, "save");
                    this.canvas.renderAll();
                }
            }
        }, this, false, placeholder.label);
    },

    editCabinetLabel: function(cabinet) {
        if (this.debug) console.log("DCLayout::editCabinetLabel()");
        var found = false,
            objects = this.canvas.getObjects();

        Ext.Msg.prompt('Cabinet Name', 'Cabinet name:', function (btn, text) {
            if (btn == 'ok') {
                // check to be sure that this cabinet doesn't already exist
                found = false;
                for (var i=0; i<objects.length; i++) {
                    if (objects[i].isType('cabinet') && objects[i].label === text) {
                        found = true;
                    }
                }
                if (found) {
                    Ext.Msg.alert("Edit Cabinet Name", "Cabinet " + text + " already exists. Please choose a different name.");
                } else {
                    cabinet.label = text;
                    this.saveObject(cabinet, "save");
                    this.canvas.renderAll();
                }
            }
        }, this, false, cabinet.label);
    },

    editCabinetType: function(cabinet) {
        if (this.debug) console.log("DCLayout::editCabinetType()");

        var objects = this.canvas.getObjects();

        var form = new Ext.form.FormPanel({
            //border: false,
            layout:       'form',
            frame:        true,
            labelWidth:   100,
            defaultType:  'textfield',
            monitorValid: true,
            items:        [
                {
                    xtype:          'combo',
                    label:          'Cabinet Type',
                    id:             'cabinetType',
                    name:           'cabinetType',
                    forceSelection: true,
                    triggerAction:  'all',
                    typeAhead:      true,
                    hideTrigger:    false,
                    minChars:       3,
                    mode:           'remote',
                    store:          this.cabinetTypesStore,
                    valueField:     'id',
                    displayField:   'name',
                    width:          200
                }
            ],
            buttons:      [
                {
                    text:     'Apply',
                    formBind: true,
                    scope:    this,
                    handler:  function () {
                        var cabId = Ext.getCmp("cabinetType").getValue();
                        var imgEl = document.getElementById('img-' + cabId);
                        this.cabinet.setElement(imgEl);
                        this.cabinet.set('cabinetTypeId', cabId);
                        this.saveObject(this.cabinet, "save");
                        this.canvas.renderAll();
                        win.close();
                    }
                },
                {
                    text:    'Cancel',
                    handler: function () {
                        win.close();
                    }
                }
            ]
        });

        // create and show window
        var win = new Ext.Window({
            title:     'Editing Cabinet Type',
            modal:     true,
            constrain: true,
            width:     400,
            height:    200,
            layout:    'fit',
            closable:  false,
            border:    false,
            items:     [
                form
            ]
        });

        win.show();
    },


    /**
     * **********************************************************************************
     * Delete and rotate functions
     * **********************************************************************************
     */
    deleteObject: function(target) {
        if (this.debug) console.log("DCLayout::deleteCabinets()");

        if (target.isType('cabinet')) {
            var cabinet = target;
            if (cabinet.get('numAssets') > 0) {
                Ext.Msg.alert(
                    'Error',
                    "Assets still exist in cabinets: " + cabinet.get('label') +
                        ". You must remove all assets in a cabinet before it can be deleted."
                );
            } else {
                Ext.Msg.show({
                    title:   'Delete Cabinet?',
                    msg:     'Are you sure you want to delete cabinet: ' + cabinet.get('label') + '?',
                    buttons: Ext.Msg.YESNO,
                    scope:   this,
                    fn:      function (button) {
                        if (button === 'yes') {
                            cabinet.remove();
                            this.saveObject(cabinet, "delete");
                            delete this.cabinetsHashById[cabinet.get('id')];
                        }
                    }
                });
            }
        }
        else {
            target.remove();
            this.saveObject(target, "delete");
            this.canvas.renderAll();
        }
    },

    rotateObject: function(target) {
        if (target.get('angle') == 0) {
            target.setAngle(-90);
        } else {
            target.setAngle(0);
        }
        this.saveObject(target, "save");
        this.canvas.renderAll();
    },


    /**
     * **********************************************************************************
     * Functions to add new objects
     * **********************************************************************************
     */
    newCabinet: function(imgId) {
        if (this.debug) console.log("DCLayout::newCabinet()");

        var imgEl = document.getElementById('img-' + imgId);
        var cabinet = new Cabinet(imgEl, {

            id: 0,
            label: "New",
            locationId: this.currentLocationId,
            cabinetTypeId: imgId,

            left: 100,
            top: 100,
            angle: 0,
            width: imgEl.width,
            height: imgEl.length,

            hasExceptions: 0,
            numAssets: 0
        });
        this.canvas.add(cabinet);
        this.saveObject(cabinet);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newPlaceholder: function() {
        var objectId = 19,
            imgEl = document.getElementById('img-' + objectId);

        var placeholder = new Placeholder(imgEl, {
            id: 0,
            locationId: this.currentLocationId,
            label: 'New',
            cabinetTypeId: objectId,

            tileX: 10,
            tileY: 10,

            left: 50,
            top: 50,
            angle: 0,

            width: 24,
            height: 48
        });
        this.canvas.add(placeholder);
        this.saveObject(placeholder);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newPerfTile: function() {
        var objectId = 22,
            imgId = objectId,
            imgEl = document.getElementById('img-' + objectId);

        var perfTile = new PerfTile(imgEl, {
            id: 0,
            locationId: this.currentLocationId,
            cabinetTypeId: objectId,

            tileX: 10,
            tileY: 10,

            left: 50,
            top: 50,
            angle: 0,

            width: 24,
            height: 24
        });
        this.canvas.add(perfTile);
        this.saveObject(perfTile);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newColumn: function(imgId) {
        var imgEl = document.getElementById('img-' + imgId);

        var column = new Column(imgEl, {
            id: 0,
            locationId: this.currentLocationId,
            cabinetTypeId: imgId,

            tileX: 10,
            tileY: 10,

            left: 50,
            top: 50,
            angle: 0,

            width: imgEl.width,
            height: imgEl.height
        });
        this.canvas.add(column);
        this.saveObject(column);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newPdu: function() {
        var objectId = 23,
            imgEl = document.getElementById('img-' + objectId);

        var pdu = new PDU(imgEl, {
            id: 0,
            locationId: this.currentLocationId,
            cabinetTypeId: objectId,

            tileX: 10,
            tileY: 10,

            left: 50,
            top: 50,
            angle: 0,

            width: imgEl.width,
            height: imgEl.height
        });
        this.canvas.add(pdu);
        this.saveObject(pdu);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newText: function() {
        var text = new Label("label", {
            id: 0,
            locationId: this.currentLocationId,

            left: 50,
            top: 50,
            angle: 0,

            // color not supported in text objects
            //color: rec.color,

            fontFamily: this.defaultFont,
            fontSize: this.defaultFontSize,
            fontWeight: this.defaultFontWeight
        });
        this.canvas.add(text);
        this.saveObject(text);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newLine: function() {
        var points = [-24, 0, 24, 0];
        var line = new Line(points, {
            id: 0,
            locationId: this.currentLocationId,

            top: 96,
            left: 96,
            width: 48,
            height: 0
        });
        this.canvas.add(line);
        line.setCoords();

        console.log(line.toObject());

        this.saveObject(line);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newCrac: function() {
        var objectId = 26,
            imgEl = document.getElementById('img-' + objectId);

        var crac = new CRAC(imgEl, {
            id: 0,
            locationId: this.currentLocationId,
            cabinetTypeId: objectId,

            tileX: 10,
            tileY: 10,

            left: 50,
            top: 50,
            angle: 0,

            width: imgEl.width,
            height: imgEl.height
        });
        this.canvas.add(crac);
        this.saveObject(crac);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));
    },

    newGeneric: function() {
        var objectId = 24;

        var generic = new Generic({
            id: 0,
            locationId: this.currentLocationId,
            cabinetTypeId: objectId,

            left: 24,
            top: 24,
            angle: 0,

            tileX: 10,
            tileY: 10,

            width: 24,
            height: 24
        });
        this.canvas.add(generic);
        this.saveObject(generic);
        this.canvas.setActiveObject(this.canvas.item(this.canvas.getObjects().length - 1));

        /*
        var label = new Label("XXX", {
            left: 50,
            top: 50,

            fontFamily: this.defaultFont,
            fontSize: 14,
            fontWeight: this.defaultFontWeight
        });

        this.canvas.add(box);
        this.canvas.add(label);

        var group = new fabric.Group([box, label], {
            centerX: "",
            centerY: "top",
            borderScaleFactor: 1,
            borderColor: "#0000FF",
            cornerColor: "#0000FF",
            cornerSize: 12,
            borderOpacityWhenMoving: 0.5
        });

        this.canvas.add(group);
        */
    },


    /**
     * **********************************************************************************
     * Install Asset
     * **********************************************************************************
     */

    installAsset: function() {
        this.fireEvent('installasset', this);
    },


    /**
     * **********************************************************************************
     * Asset Search Functions
     * **********************************************************************************
     */

    assetSelected: function(combo, record) {
        var data = record.data,
            assetId = data.id,
            locationId = data.locationId,
            cabinetId = data.cabinetId,
            elevation = data.elevation,
            state = data.state,
            cabinet;

        if (state !== "Installed") {
            this.fireEvent('switchtab', this, 1, data);
        }
        else if (locationId !== this.currentLocationId) {
            this.currentLocationId = locationId;
            this.getObjects(cabinetId, assetId);
        } else {
            cabinet = this.cabinetsHashById[cabinetId];
            this.selectCabinet(cabinet);
            this.getCabinetElevation(cabinet, assetId);
        }
    },

    selectCabinet: function(cabinet) {
        this.unselectAllCabinets();
        cabinet.set('selected', true);
        this.canvas.renderAll(true);
        this.getCabinetElevation(cabinet);
    },

    unselectAllCabinets: function() {
        var cabinets = this.getArrayOfCabinets();
        for (var i=0; i<cabinets.length; i++) {
            cabinets[i].set('selected', false);
        }
        this.canvas.renderAll(true);
    },

    unhighlightCabinets: function () {
        var cabinets = this.getArrayOfCabinets();
        if (cabinets.length > 0) {
            for (var i = 0; i < cabinets.length; i++) {
                cabinets[i].set('highlighted', false);
            }
        }
        this.canvas.renderAll(true);
    },

    businessServiceSelected: function(combo, record) {
        this.loadMask.show("Getting racks used by " + record.data.name);
        Ext.Ajax.request({
            url:        'php/get_racks_by_bs.php',
            params:     {
                bsSysId: record.data.sysId
            },
            scope:      this,
            mycallback: function (json, options) {
                this.loadMask.hide();
                this.unhighlightCabinets();
                for (var i=0; i<json.cabinets.length; i++) {
                    var c = json.cabinets[i];
                    if (this.cabinetsHashById[c.id]) {
                        this.cabinetsHashById[c.id].set('highlighted', true);
                    }
                }
                this.canvas.renderAll(true);
            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    /**
     * **********************************************************************************
     * Cabinet Utilization Functions
     * **********************************************************************************
     */

    toggleShowCapacity: function() {
        this.showUtilization = !this.showUtilization;
        if (this.showUtilization) {
            this.resetCabinetsUtilization();
            this.getCabinetUtil();
        } else {
            this.resetCabinetsUtilization();
        }
    },

    resetCabinetsUtilization: function() {
        if (this.debug > 2) console.log("DCLayout::resetCabinetsUtilization()");
        var cabinets = this.getArrayOfCabinets();
        if (cabinets.length > 0) {
            for (var i = 0; i < cabinets.length; i++) {
                cabinets[i].set('utilStatus', ACDC.CABINETUTILOK);
            }
        }
        this.canvas.renderAll(true);
    },

    getCabinetUtil: function() {
        if (this.debug > 2) console.log("DCLayout::getCabinetUtil()");
        Ext.Ajax.request({
            url: 'php/get_cabinet_util.php',
            params: {
                locationId: this.currentLocationId
            },
            scope: this,
            mycallback: function(json, options) {
                var cab, util, i;

                /** @namespace json.util */
                for (i=0; i<json.util.length; i++) {
                    util = json.util[i];
                    cab = this.cabinetsHashById[util.id];
                    if (cab) {
                        cab.set('utilStatus', util.utilStatus);
                        cab.set('numAssets', util.numAssets);
                        cab.set('numRUsUsed', util.numRUs);
                    }
                }
                this.showUtilization = true;
                this.canvas.renderAll(true);
            },
            myerrorcallback: function(json, options, response) {
                /** @namespace json.errorText */
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },


    /**
     * **********************************************************************************
     * Cabinet Exception Functions
     * **********************************************************************************
     */

    toggleShowExceptions: function() {
        var cabinets = this.getArrayOfCabinets();
        this.showExceptions = !this.showExceptions;

        for (var i=0; i<cabinets.length; i++) {
            cabinets[i].set('showExceptions', this.showExceptions);
        }
        this.canvas.renderAll(true);
    },


    /**
     * **********************************************************************************
     * Helper Functions
     * **********************************************************************************
     */

    getArrayOfCabinets: function() {
        var cabinets = [],
            objects = this.canvas.getObjects();
        for (var i=0; i<objects.length; i++) {
            if (objects[i].isType('cabinet')) {
                cabinets.push(objects[i]);
            }
        }
        return cabinets;
    },









    /**
     * **********************************************************************************
     * Old functions not yet refactored
     * **********************************************************************************
     */

    /* Doors */
    getDoors: function() {
        if (this.debug) console.log("DCLayout::getDoors()");

        Ext.Ajax.request({
            url: 'php/get_doors.php',
            params: {
                locationId: this.currentLocationId
            },
            scope: this,
            mycallback: function(json, options) {
                /** @namespace json.doors */
                this.createDoors(json.doors);
            },
            myerrorcallback: function(json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createDoors: function(doors) {
        if (this.debug) console.log("DCLayout::createDoors()");

        for (var i=0; i<doors.length; i++) {
            var d = doors[i];

            var counterClockwise = !this.clockwise,
                endAngle,
                x2, y2;

            // 15.5, 2, 14.5, 3

            // draw the line representing the door
            if (this.startAngle == 0 && this.clockwise) {
                x2 = parseInt(d.x) + 1;
                y2 = parseInt(d.y) + 1;
                endAngle = 90;
            } else if (this.startAngle == 0 && !this.clockwise) {
                x2 = parseInt(d.x) + 1;
                y2 = parseInt(d.y) - 1;
                endAngle = 90 * -1;
            } else if (this.startAngle == 180 && this.clockwise) {
                x2 = parseInt(d.x) - 1;
                y2 = parseInt(d.y) - 1;
                endAngle = 270;
            } else if (this.startAngle == 180 && !this.clockwise) {
                x2 = parseInt(d.x) - 1;
                y2 = parseInt(d.y) + 1;
                endAngle = 90;
            }

            var door = new fabric.Circle({
                left: parseInt(d.centerX) * this.tileSize,
                top: parseInt(d.centerY) * this.tileSize,
                radius: parseFloat(d.radius) * this.tileSize,
                stroke: d.color,
                strokeWidth: parseFloat(d.width),
                fill: "",
                startAngle: parseFloat(d.startAngle),
                endAngle: Math.PI / 2
            });
            this.canvas.add(door);
        }

        /*
        for (i = 0; i < doors.length; i++) {
            d = doors[i];
            door = new ACDC.Door({
                ctx: this.canvasBufferCtx,
                debug: this.debug,
                tileSize: this.tileSize,
                id: parseInt(d.id),
                locationId: parseInt(d.locationId),
                centerX: parseFloat(d.centerX),
                centerY: parseFloat(d.centerY),
                radius: parseFloat(d.radius),
                startAngle: parseFloat(d.startAngle),
                clockwise: parseInt(d.clockwise),
                color: d.color,
                width: parseFloat(d.width)
            });
            this.doors.push(door);
        }
        */
    },

    addAsset: function() {
        this.fireEvent('addasset', this);
    },

    /* View Options */
    onGridSpacingChange: function(item, e) {
        if (this.debug) console.log("DCLayout::onGridSpacingChange()");

        e.stopEvent();

        if (item.id === "opts-grid-spacing-1") {
            this.gridSpacingOpt = 1;
        }
        else if (item.id === "opts-grid-spacing-2") {
            this.gridSpacingOpt = 2;
        }
        else if (item.id === "opts-grid-spacing-3") {
            this.gridSpacingOpt = 3;
        }
        else if (item.id === "opts-grid-spacing-4") {
            this.gridSpacingOpt = 4;
        }
        else if (item.id === "opts-grid-spacing-5") {
            this.gridSpacingOpt = 5;
        }
        this.redrawCanvas();
    },

    onGridChange: function(item, e) {
        if (this.debug) console.log("DCLayout::onGridChange()");

        e.stopEvent();

        this.grid = item.id === "opts-grid-on";
        this.redrawCanvas();
    },

    onSnapChange: function(item, e) {
        if (this.debug) console.log("DCLayout::onSnapChange()");

        e.stopEvent();

        this.snap = item.id === "opts-snap-on";
    },

    onDebugChange: function(item, e) {
        if (this.debug) console.log("DCLayout::onDebugChange()");
        e.stopEvent();
        this.debug = item.id === "opts-debug-on";
    },

    onZoomChange: function(item, e) {
        e.stopEvent();

        this.scale = item.zoom;
        this.canvas.setZoom(this.scale);

        /*
        this.scale = item.zoom;

        this.canvas.width = this.defaultWidth * ( 1 / this.scale);
        this.canvas.height = this.defaultHeight * ( 1 / this.scale);

        this.canvasBuffer.width = this.canvas.width;
        this.canvasBuffer.height = this.canvas.height;

        this.redrawCanvas();
        */
    },

    findCabinetById: function (id) {
        for (var i = 0; i < this.cabinets.length; i++) {
            if (this.cabinets[i].id == id) {
                return this.cabinets[i];
            }
        }
        return false;
    },


    printCanvas: function() {
        if (this.debug) console.log("DCLayout::printCanvas()");
        var img = this.canvas.toDataURL("image/png");
        document.write('<img src="' + img + '"/>');
    }
});


