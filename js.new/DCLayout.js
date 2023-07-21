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

    currentLocationId: 1, // Sterling
    location: {
        id: 1,
        name: 'Location'
    },

    /** for testing purposes */
    //onLoadTileLocation: "05G",
    onLoadTileLocation: "",

    imageSrcs: {},
    images: {},

    // object structures
    objects: {
        list: ['cabinet', 'line'],
        cabinet: {
            all: [],
            selected: [],
            highlighted: [],
            copied: []
        },
        line: {
            all: [],
            selected: [],
            highlighted: [],
            copied: []
        }
    },

    cabinetsCopied: [],

    cabinetsHash: [],
    numCabinetsGotten: 0,

    // options
    debug: ACDC.debug,
    grid: true,
    snap: true,
    gridSpacing: {
        1: 6,
        2: 12,
        3: 24,
        4: 48,
        5: 96
    },
    gridSpacingOpt: 3,

    showUtilization: false,
    showExceptions: false,

    selectRegion: {
        x: null,
        y: null,
        width: null,
        height: null,
        offsetX: null,
        offsetY: null
    },

    // location of mouse down on group drag
    grabX: null,
    grabY: null,

    mouse: null,

    objectAtCursor: null,
    canvasDirty: false,

    selecting: false,
    dragging: false,
    groupDrag: false,
    drawingLine: false,
    stretchLine: false,
    newLine: {},
    showDetailsOnClick: true,

    defaultHeight: 2000,
    defaultWidth: 2000,
    scale: 1,

    layoutLoaded: false,

    initComponent: function() {
        Ext.apply(this, arguments);

        //this.debug = 0;

        this.addEvents(
            'showcabinetelevation',
            'onlocationselect',
            'sendfeedback',
            'showusers',
            'installasset',
            'addasset'
        );

        this.editableByUser = this.actor.accessCode === 1 || this.actor.accessCode === 3;

        this.cabinetTypesStore = new Ext.data.Store({
            baseParams: {
                view: this.view
            },
            proxy: new Ext.data.HttpProxy({
                url: 'php/get_cabinet_types.php',
                mycallback: function() {
                }
            }),
            reader: new Ext.data.JsonReader({
                root: 'cabinetTypes',
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
            tbar: this.toolbar,
            //resizable: true,
            //autoScroll: true,
            html: '<div id="canvas-div" class="canvas-div"><canvas id=canvas-id class="canvas"></canvas></div>'
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
        if (this.debug > 1) console.log("DCLayout::afterRender()");

        var box;

        this.loadMask = new Ext.LoadMask(this.getEl(), {
            msg: 'Loading data center layout...'
        });

        this.doLayout();

        this.canvas = Ext.get("canvas-id").dom;

        if (this.canvas && this.canvas.getContext) {
            box = this.getBox();

            var canvasDiv = Ext.get("canvas-div");
            canvasDiv.setHeight(box.height);
            canvasDiv.setWidth(box.width);

            this.canvas.width = this.defaultWidth * ( 1 / this.scale);
            this.canvas.height = this.defaultHeight * ( 1 / this.scale);

            if (this.debug > 2) ACDC.ConsoleLog("canvas height=" + box.height + ", canvas width=" + box.width);
            this.canvasCtx = this.canvas.getContext("2d");

            // get the x & y offsets from the screen to the panel
            // adding 30 to y because of the toolbar/header

            this.offsetX = box.x;
            this.offsetY = box.y + 56;

            this.canvasBuffer = document.createElement('canvas');
            this.canvasBuffer.width = this.canvas.width;
            this.canvasBuffer.height = this.canvas.height;
            this.canvasBufferCtx = this.canvasBuffer.getContext('2d');
        }

        this.getImages();
        this.getLines();

        this.onMouseDownBind = this.onMouseDown.bind(this);
        this.canvas.addEventListener("mousedown", this.onMouseDownBind, false);

        this.onMouseUpBind = this.onMouseUp.bind(this);
        this.canvas.addEventListener("mousedown", this.onMouseUpBind, false);

        this.onClickBind = this.onClick.bind(this);
        this.canvas.addEventListener("click", this.onClickBind, false);

        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.canvas.addEventListener("mousemove", this.onMouseMoveBind, false);

        this.showContextMenuBind = this.showContextMenu.bind(this);
        this.canvas.addEventListener("contextmenu", this.showContextMenuBind, false);

        /*
         this.onDblClickBind = this.onDblClick.bind(this);
         this.canvas.addEventListener("dblclick", this.onDblClickBind, false);
         */
    },


    /* Waits for AJAX call to get cabinets to complete */
    initialUpdateRun: function() {
        var i,
            cabinets = this.getObjects('cabinet'),
            numCabs = Object.keys(cabinets).length;

        if (this.debug > 1) console.log("DCLayout::initialUpdateRun(): numCabinetsGotten: " + this.numCabinetsGotten + ", cabinets.length: " + numCabs);

        if (numCabs > 0 && numCabs === this.numCabinetsGotten) {
            for (var id in cabinets) {
                if (cabinets.hasOwnProperty(id)) {
                    if (!cabinets[id].imageLoaded) {
                        return;
                    }
                }
            }
            clearInterval(this.initialUpdateDraw);

            this.redrawCanvas();
        }
    },


    installAsset: function() {
        this.fireEvent('installasset', this);
    },

    addAsset: function() {
        this.fireEvent('addasset', this);
    },

    /* Location selection */
    selectionLocation: function(locationId) {
        this.currentLocationId = locationId;

        // fire event to clear the cabinet details
        this.fireEvent('onlocationselect', this);
    },

    /* Exceptions */
    toggleShowExceptions: function() {
        this.showExceptions = !this.showExceptions;
        this.redrawCanvas();
    },

    /* Cabinet Utilization */
    toggleShowCapacity: function() {
        this.showUtilization = !this.showUtilization;
        if (this.showUtilization) {
            this.getCabinetUtil();
        } else {
            this.redrawCanvas();
        }
    },

    resetCabinetsUtilization: function() {
        if (this.debug > 2) console.log("DCLayout::resetCabinetsUtilization()");
        var cabinets = this.getObjects('cabinet');

        this.hashIterate(cabinets, function(id) {
            cabinets[id].setUtilStatus(CABINETUTILOK);
        }, this)
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

                this.resetCabinetsUtilization();
                for (i = 0; i < json.util.length; i++) {
                    util = json.util[i];
                    cab = this.cabinetsHash[util.id];
                    if (cab) {
                        cab.setUtilStatus(util.status);
                        cab.setNumAssets(util.numAssets);
                        cab.setNumRUsUsed(util.numRUs);
                    }
                }
                this.showUtilization = true;
                this.redrawCanvas();
            },
            myerrorcallback: function(json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    /* Context-sensitive Menu */
    showContextMenu: function(e) {
        if (this.debug > 1) console.log("DCLayout::showContextMenu()");

        var m = this.getMousePosition(e),
            objectAtCursor = this.getObjectAtMouse(m),
            onCabinet = false,
            onLine = false;

        if (objectAtCursor) {
            if (objectAtCursor.getObjectType() === 'cabinet') {
                onCabinet = true;
                if (!objectAtCursor.selected) {
                    this.unselectObjects('cabinet');
                    this.selectObject(objectAtCursor);
                    this.redrawCanvas();
                }
            } else if (objectAtCursor.getObjectType() === 'line') {
                onLine = true;
                if (!objectAtCursor.selected) {
                    this.unselectObjects('line');
                    this.selectObject(objectAtCursor);
                    this.redrawCanvas();
                }
            }
        }

        if (this.debug > 2) console.log("DCLayout::showContextMenu(): onCabinet=" + onCabinet + ", onLine=" + onLine);

        // define the contenxt senstive menu
        var menu = new Ext.menu.Menu({
            shadow: 'drop',
            items: [
                {
                    text: 'Cut',
                    scope: this,
                    disabled: this.editableByUser && (onCabinet || onLine) ? false : true,
                    handler: function() {
                        this.cutCabinets();
                        menu.hide();
                    }
                },
                {
                    text: 'Copy',
                    scope: this,
                    disabled: this.editableByUser && (onCabinet || onLine) ? false : true,
                    handler: function() {
                        this.copyCabinets();
                        menu.hide();
                    }
                },
                {
                    text: 'Paste',
                    scope: this,
                    disabled: this.editableByUser && this.cabinetsCopied.length > 0 ? false : true,
                    handler: function() {
                        this.pasteCabinets();
                        menu.hide();
                    }
                },
                {
                    text: 'Delete',
                    scope: this,
                    disabled: this.editableByUser && (onCabinet || onLine) ? false : true,
                    handler: function() {
                        if (objectAtCursor.getObjectType() === 'cabinet') {
                            this.deleteCabinets();
                        } else if (objectAtCursor.getObjectType() === 'line') {
                            this.deleteLines();
                        }
                        menu.hide();
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: 'Edit Name',
                    disabled: this.editableByUser && onCabinet ? false : true,
                    scope: this,
                    handler: function() {
                        this.editName(e);
                        menu.hide();
                    }
                },
                {
                    text: 'Edit Cabinet Type',
                    disabled: this.editableByUser && onCabinet ? false : true,
                    scope: this,
                    handler: function() {
                        this.editCabinetType(e);
                        menu.hide();
                    }
                }
            ]
        });
        menu.showAt([m.x + 30, m.y + 40]);
    },

    /* View Options */
    onGridSpacingChange: function(item, e) {
        if (this.debug > 1) console.log("DCLayout::onGridSpacingChange()");

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
        if (this.debug > 1) console.log("DCLayout::onGridChange()");

        e.stopEvent();

        this.grid = item.id === "opts-grid-on";
        this.redrawCanvas();
    },

    onSnapChange: function(item, e) {
        if (this.debug > 1) console.log("DCLayout::onSnapChange()");

        e.stopEvent();

        this.snap = item.id === "opts-snap-on";
    },

    onDebugChange: function(item, e) {
        if (this.debug > 1) console.log("DCLayout::onDebugChange()");
        e.stopEvent();
        this.debug = item.id === "opts-debug-on";
    },

    onZoomChange: function(item, e) {
        e.stopEvent();
        this.scale = item.zoom;

        this.canvas.width = this.defaultWidth * ( 1 / this.scale);
        this.canvas.height = this.defaultHeight * ( 1 / this.scale);

        this.canvasBuffer.width = this.canvas.width;
        this.canvasBuffer.height = this.canvas.height;

        this.redrawCanvas();
    },

    /* Selecting */
    selectStart: function() {
        if (this.debug > 1) console.log("DCLayout::selectStart()");

        this.selecting = true;

        this.selectBind = this.select.bind(this);
        this.canvas.addEventListener("mousemove", this.selectBind, false);

        this.selectEndBind = this.selectEnd.bind(this);
        this.canvas.addEventListener("mouseup", this.selectEndBind, false);
    },

    selectEnd: function() {
        var selected = this.getSelectedObjects('cabinet');
        if (this.debug > 1) console.log("DCLayout::selectEnd()");

        if (this.debug > 2) console.log(Object.keys(selected).length + " cabinets selected");
        this.canvas.removeEventListener("mousemove", this.selectBind);
        this.canvas.removeEventListener("mouseup", this.selectEndBind);

        this.selecting = false;
        this.redrawCanvas();
    },

    select: function(e) {
        if (this.debug > 1) console.log("DCLayout::select()");

        var r,
            cabinets = this.getObjects('cabinet'),
            m = this.getMousePosition(e),
            sr = this.selectRegion;

        sr.width = m.x - sr.x;
        sr.height = m.y - sr.y;

        this.hashIterate(cabinets, function(id, sr) {
            var cab = cabinets[id];
            if (cab.midX >= sr.x && cab.midX <= sr.x + sr.width &&
                cab.midY >= sr.y && cab.midY <= sr.y + sr.height) {
                this.selectObject(cab);
            }
            else {
                this.unselectObject(cab);
            }
        }, this, sr);

        this.redrawCanvas();
    },

    assetSelected: function(combo, record) {
        var assetId = record.data.id,
            locationId = record.data.locationId,
            cabinetId = record.data.cabinetId;

        if (locationId !== this.currentLocationId) {
            this.currentLocationId = locationId;
            this.getCabinets(this.selectCabinet, cabinetId, assetId);
        } else {
            this.selectCabinet(cabinetId, assetId);
        }
    },

    selectCabinet: function(cabinetId, assetId) {
        var cabinet = this.findCabinetById(cabinetId);
        if (cabinet) {
            this.unselectObjects('cabinet');
            this.selectObject(cabinet);
            this.redrawCanvas();
            this.getCabinetElevation(cabinet, assetId);
        }
    },

    /**
     * *************************************************************************************
     * New functions
     * *************************************************************************************
     */

    getObjects: function(objects) {
        if (this.debug > 2) console.log("DCLayout::getObjects(" + objects + ")");
        var objectsArray = [];
        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                objectsArray = objectsArray.concat(this.objects[this.objects.list[i]].all);
            }
        } else {
            objectsArray = this.objects[objects].all;
        }
        return objectsArray;
    },

    areObjectsSelected: function(objects) {
        var count = 0;
        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                count += this.objects[this.objects.list[i]].selected.length;
            }
            return count;
        }
        return this.objects[objects].selected.length > 0;
    },

    /**
     * Get all selected objects
     * @param objects ('all', 'cabinet', 'line', etc)
     */
    getSelectedObjects: function(objects) {
        var selected =[];
        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                selected = selected.concat(this.objects[this.objects.list[i]].selected);
            }
        } else {
            selected = this.objects[objects].selected;
        }
        return selected;
    },

    /**
     * Get all hightlighted objects
     * @param objects ('all', 'cabinet', 'line', etc)
     */
    getHighlightedObjects: function(objects) {
        var highlighted =[];
        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                highlighted = highlighted.concat(this.objects[this.objects.list[i]].highlighted);
            }
        } else {
            highlighted = this.objects[objects].highlighted;
        }
        return highlighted;
    },

    /**
     * Select an object and add to the selected array
     * @param object the object to select
     */
    selectObject: function(object) {
        if (this.debug > 2) console.log("DCLayout::selectObject(): type=" + object.getObjectType());
        var type = object.getObjectType();
        if (!object.isSelected()) this.canvasDirty = true;
        object.select();
        this.objects[type].selected[object.getId()] = object;
    },

    /**
     * Unselects an object and remove from the selected array
     * @param object the object to select
     */
    unselectObject: function(object) {
        if (this.debug > 2) console.log("DCLayout::unselectObject(): type=" + object.getObjectType());
        var type = object.getObjectType();
        if (object.isSelected()) this.canvasDirty = true;
        object.unselect();
        this.objects[type].selected.splice(object.getId(), 1);
    },

    /**
     * Unselects all objects in a provided list
     * @param objects ('all', 'cabinet', 'line', etc)
     */
    unselectObjects: function(objects) {
        var selected = this.getSelectedObjects(objects);

        for (var o in selected) {
            if (selected.hasOwnProperty(o)) {
                selected[o].unselect();
            }
        }

        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                this.objects[this.objects.list[i]].selected = [];
            }
        } else {
            this.objects[objects].selected = [];
        }
        this.groupDrag = false;
    },

    /**
     * Highlight an object and add to the highlighted array
     * @param object the object to highlight
     */
    highlightObject: function(object) {
        var type = object.getObjectType();
        if (!object.isHighlighted()) this.canvasDirty = true;
        object.highlight();
        this.objects[type].highlighted[object.getId()] = object;
    },

    /**
     * Unhighlight an object and remove from the highlighted array
     * @param object the object to unhighlight
     */
    unhighlightObject: function(object) {
        if (this.debug > 2) console.log("DCLayout::unhighlightObject(): type=" + object.getObjectType());
        var type = object.getObjectType();
        if (object.isHighlighted()) this.canvasDirty = true;
        object.unhighlight();
        this.objects[type].highlighted.splice(object.getId(), 1);
    },

    /**
     * Unhighlights all objects in a provided list
     * @param objects ('all', 'cabinet', 'line', etc)
     */
    unhighlightObjects: function(objects) {
        var highlighted = this.getHighlightedObjects(objects);
        for (var j=0; j<highlighted.length; j++) {
            highlighted.unhighlight();
        }
        if (objects === 'all') {
            for (var i=0; i<this.objects.list.length; i++) {
                this.objects[this.objects.list[i]].highlighted = [];
            }
        } else {
            this.objects[objects].highlighted = [];
        }
    },

    /**
     * *************************************************************************************
     *
     * *************************************************************************************
     */

    businessServiceSelected: function(combo, record) {
        this.loadMask.show("Getting racks used by " + record.data.name);
        Ext.Ajax.request({
            url: 'php/get_racks_by_bs.php',
            params: {
                bsSysId: record.data.sysId
            },
            scope: this,
            mycallback: function(json, options) {
                this.loadMask.hide();
                this.unhighlightObjects('cabinet');
                for (var i = 0; i < json.cabinets.length; i++) {
                    var c = json.cabinets[i];
                    if (this.cabinetsHash[c.id]) {
                        this.highlightObject(this.cabinetsHash[c.id]);
                    }
                }
                this.redrawCanvas();
            },
            myerrorcallback: function(json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    /* Dragging */
    dragStart: function() {
        // no dragging allowed if not permitted for this user
        if (!this.editableByUser) return;

        if (this.debug > 1) console.log("DCLayout::dragStart()");

        this.dragging = true;

        this.dragBind = this.drag.bind(this);
        this.canvas.addEventListener("mousemove", this.dragBind, false);

        this.dragEndBind = this.dragEnd.bind(this);
        this.canvas.addEventListener("mouseup", this.dragEndBind, false);
    },

    dragEnd: function() {
        // no dragging allowed if not permitted for this user
        if (!this.editableByUser) return;

        if (this.debug > 1) console.log("DCLayout::dragEnd()");

        var object,
            objects = this.getSelectedObjects('all'),
            spacing = this.gridSpacing[this.gridSpacingOpt];

        this.dragging = false;

        this.canvas.removeEventListener("mousemove", this.dragBind);
        this.canvas.removeEventListener("mouseup", this.dragEndBind);

        if (this.groupDrag) {
            this.hashIterate(objects, function(id, spacing) {
                object = objects[id];
                object.moveTo(Math.round(object.x / spacing) * spacing,
                    Math.round(object.y / spacing) * spacing);
                if (object.x !== object.selectX || object.y !== object.selectY) {
                    object.save();
                    this.showDetailsOnClick = false;
                }
            }, this, spacing);
        }
        else {
            object = objects[Object.keys(objects)[0]];

            // if the object was not moved, then it was just clicked to show details.
            // therefore, don't snap to grid or save. just show details
            if (object.x1 === object.selectX || object.y1 === object.selectY) {
                this.showDetailsOnClick = true;
            }
            else {
                if (this.snap) {
                    if (object.getObjectType() === "line") {
                        if (object.stretchEnd === 1) {
                            object.stretchTo(Math.round(object.x1 / spacing) * spacing,
                                Math.round(object.y1 / spacing) * spacing);
                        } else if (object.stretchEnd === 2) {
                            object.stretchTo(Math.round(object.x2 / spacing) * spacing,
                                Math.round(object.y2 / spacing) * spacing);
                        }
                    } else {
                        object.moveTo(Math.round(object.x1 / spacing) * spacing,
                            Math.round(object.y1 / spacing) * spacing);
                    }
                }
                if (object.getObjectType() === "line") {
                    if (object.stretchEnd === 1 && (object.x1 !== object.selectX || object.y1 !== object.selectY)) {
                        object.save();
                    } else if (object.stretchEnd === 2 && (object.x2 !== object.selectX || object.y2 !== object.selectY)) {
                        object.save();
                    }
                } else {
                    if (object.x1 !== object.selectX || object.y1 !== object.selectY) {
                        object.save();
                        this.showDetailsOnClick = false;
                    }
                }
            }
        }
        if (object.getObjectType() === "line") object.stretchEnd = false;
        this.redrawCanvas();
    },

    drag: function(e) {
        // no dragging allowed if not permitted for this user
        if (!this.editableByUser) return;

        if (this.debug > 1) console.log("DCLayout::drag()");

        var sr, x, y, object,
            m = this.getMousePosition(e),
            objects = this.getSelectedObjects('all');

        if (this.groupDrag) {
            // need to move all selected objects

            if (this.debug > 1) console.log("DCLayout::drag(): objects.length: " + Object.keys(objects).length);
            this.hashIterate(objects, function(id, m) {
                object = objects[id];
                if (this.debug > 2) console.log("DCLayout::drag(): object.x: " + object.x + ", m.x: " + m.x + ", object.offsetX: " + object.offsetX + ", (m.x - object.offsetX): " + (m.x - object.offsetX));

                x = object.selectX + (m.x - this.grabX);
                y = object.selectY + (m.y - this.grabY);
                if (this.debug > 2) console.log("DCLayout::drag(): move " + object.getObjectType() + " from " + object.x1 + ", " + object.y1 + " to " + x + ", " + y);
                object.moveTo(x, y);
            }, this, m);
        }
        else if (this.stretchLine) {
            if (this.debug > 2) console.log("DCLayout::drag(): stretch line");
            object = objects[Object.keys(objects)[0]];
            x = parseInt(object.selectX) + (m.x - this.grabX);
            y = parseInt(object.selectY) + (m.y - this.grabY);
            object.stretchTo(x, y);
        }
        else {
            object = objects[Object.keys(objects)[0]];
            x = parseInt(object.selectX) + (m.x - this.grabX);
            y = parseInt(object.selectY) + (m.y - this.grabY);
            if (this.debug > 2) console.log("DCLayout::drag(): selectX/Y=" + object.selectX +"/"+object.selectY+", m.x/y=" + m.x+"/"+ m.y+", grabX/Y=" + this.grabX + "/" + this.grabY);
            if (this.debug > 2) console.log("DCLayout::drag(): move " + object.getObjectType() + " from " + object.x1 + ", " + object.y1 + " to " + x + ", " + y);
            object.moveTo(x, y);
        }
        this.redrawCanvas();
    },

    /* Get Lines */
    getLines: function() {
        if (this.debug > 1) console.log("DCLayout::getLines()");

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
        if (this.debug > 1) console.log("DCLayout::createLines()");
        var i, l, line, linesCreated = [];

        this.objects.line.all = [];
        for (i = 0; i < lines.length; i++) {
            l = lines[i];
            line = new ACDC.Line({
                ctx: this.canvasBufferCtx,
                debug: this.debug,
                id: l.id,
                locationId: l.locationId,
                x1: l.x1,
                y1: l.y1,
                x2: l.x2,
                y2: l.y2,
                color: l.color,
                width: l.width,
                cap: l.cap
            });
            this.objects.line.all[line.getId()] = line;
        }
    },

    deleteLines: function() {
        if (this.debug > 1) console.log("DCLayout::deleteLines()");
        var l, lines = this.getSelectedObjects('line');
        this.hashIterate(lines, function(id) {
            l = lines[id];
            this.unselectObject(l);
            this.unhighlightObject(l);
            this.objects.line.all.splice(l.getId(), 1);
            l.remove();
        }, this);
        if (this.debug > 2) console.log("DCLayout::deleteLines(): resulting num lines=" + Object.keys(this.objects.line.all));
        this.redrawCanvas();
    },

    /* Draw Line */
    drawLineStart: function(m) {
        if (!this.editableByUser) return;
        if (this.debug > 1) console.log("DCLayout::drawLineStart()");

        var line,
            spacing = this.gridSpacing[this.gridSpacingOpt];

        this.newLine = new ACDC.Line({
            ctx: this.canvasBufferCtx,
            locationId: this.currentLocationId,
            x1: Math.round(m.x / spacing) * spacing,
            y1: Math.round(m.y / spacing) * spacing,
            debug: this.debug
        });
        this.objects.line.all.push(this.newLine);

        this.drawLineBind = this.drawLine.bind(this);
        this.canvas.addEventListener("mousemove", this.drawLineBind, false);

        this.drawLineEndBind = this.drawLineEnd.bind(this);
        this.canvas.addEventListener("mouseup", this.drawLineEndBind, false);
    },

    drawLineEnd: function(e) {
        if (!this.editableByUser) return;
        if (this.debug > 1) console.log("DCLayout::drawLineEnd()");

        var spacing = this.gridSpacing[this.gridSpacingOpt],
            m = this.getMousePosition(e);

        this.drawingLine = false;

        this.canvas.removeEventListener("mousemove", this.drawLineBind);
        this.canvas.removeEventListener("mouseup", this.drawLineEndBind);

        this.newLine.setX2(Math.round(m.x / spacing) * spacing);
        this.newLine.setY2(Math.round(m.y / spacing) * spacing);

        this.newLine.save();
        this.objects.line.all[this.newLine.getId()] = this.newLine;

        this.redrawCanvas();
    },

    drawLine: function(e) {
        if (!this.editableByUser) return;
        if (this.debug > 1) console.log("DCLayout::drawLine()");

        var m = this.getMousePosition(e);

        this.newLine.setX2(m.x);
        this.newLine.setY2(m.y);
        this.redrawCanvas();
    },

    /* Cabinets CRUD */
    getImages: function() {
        if (this.debug > 1) console.log("DCLayout::getImages()");

        Ext.Ajax.request({
            url: 'php/get_images.php',
            params: {
            },
            scope: this,
            mycallback: function(json, options) {
                this.loadImages(json.data);
            },
            myerrorcallback: function(json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    loadImages: function(data) {
        if (this.debug > 1) console.log("DCLayout::loadImages(): " + data.length + " images returned");

        var numImages = data.length,
            loadedImages = 0,
            d,
            id;

        this.images = {};

        for (var i = 0; i < data.length; i++) {
            d = data[i];
            id = d.id;

            this.images[id] = {
                id: d.id,
                name: d.name,
                type: d.type,
                imageName: d.imageName,
                length: d.length,
                width: d.width,
                imageFile: this.imagesDir + d.imageName,
                img: new Image()
            };
            this.images[d.id].img.onload = function() {
                if (++loadedImages >= numImages) {
                    this.getCabinets();
                }
            }.bind(this);
            if (this.debug > 2) console.log("DCLayout::loadImages(): loading " + this.images[id].name);
            this.images[id].img.src = this.images[id].imageFile;
        }
    },

    // TODO: Need a getCabinet function to be called after asset is edited or added so that the numAssets property is updated which is used by the deleteCabinet function
    getCabinets: function(callbackFn, arg1, arg2) {
        if (this.debug > 1) console.log("DCLayout::getCabinets()");

        this.layoutLoaded = false;
        this.objects.cabinet.all = [];

        this.loadMask.show();
        this.initialUpdateDraw = setInterval(this.initialUpdateRun.bind(this), 1000);

        Ext.Ajax.request({
            url: 'php/get_cabinets.php',
            params: {
                locationId: this.currentLocationId
            },
            scope: this,
            mycallback: function(json, options) {
                this.loadMask.hide();
                this.location = json.location;
                this.numCabinetsGotten = json.cabinets.length;
                this.createCabinets(json.cabinets, callbackFn, arg1, arg2);
            },
            myerrorcallback: function(json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    createCabinets: function(data, callbackFn, arg1, arg2) {
        if (this.debug > 1) console.log("DCLayout::createCabinets()");

        var rec, iName;

        this.objects.cabinet.all = [];
        this.redrawCanvas();

        for (var i = 0; i < data.length; i++) {
            rec = data[i];
            iName = rec.ctImageName;

            if (this.debug > 2) console.log("DCLayout::createCabinets(): i: " + i + ", name: " + rec.name + ", image: " + iName);
            this.addCabinet(rec);
        }
        this.layoutLoaded = true;
        if (typeof arguments[1] !== "undefined") {
            callbackFn.call(this, arg1, arg2);
        }
    },

    addCabinet: function(rec) {
        if (this.debug > 1) console.log("DCLayout::addCabinet(): name: " + rec.name + ", image: " + rec.ctImageName);

        var cabinet = new ACDC.Cabinet({
            debug: this.debug,
            id: rec.id,
            name: rec.name,
            locationId: rec.locationId,
            ctId: rec.ctId,
            ctName: rec.ctName,
            ctType: rec.ctType,
            ctImageName: rec.ctImageName,
            ctLength: rec.ctLength,
            ctWidth: rec.ctWidth,
            image: this.images[rec.ctId].img,
            imageLoaded: true,
            x: rec.x,
            y: rec.y,
            ctx: this.canvasBufferCtx,
            canvas: this.canvasBuffer,
            imagesDir: this.imagesDir,
            hasExceptions: rec.hasExceptions,
            exceptionsHtml: rec.exceptionsHtml,
            numAssets: rec.numAssets
        });
        this.objects.cabinet.all[cabinet.getId()] = cabinet;
        // TODO: no longer need hash. Update all uses
        this.cabinetsHash[cabinet.id] = cabinet;
        return cabinet;
    },

    removeCabinet: function(cabinet) {
        if (this.debug > 1) console.log("DCLayout::removeCabinet()");

        this.objects.cabinet.all.splice(cabinet.getId(), 1);
        if (this.debug > 2) console.log("DCLayout::removeCabinet(): removing id: " + cabinet.getId() + ", i: " + i + ", name: " + cabinet.getName());
    },

    cutCabinets: function() {
        if (this.debug > 1) console.log("DCLayout::cutCabinets()");

        var selectedCabs = this.getSelectedObjects('cabinet');

        if (this.debug > 2) console.log("DCLayout::cutCabinets(): selectedCabs.length: " + Object.keys(selectedCabs).length);
        this.hashIterate(selectedCabs, function(id) {
            var cab = selectedCabs[id];
            cab.id = 0;
            this.cabinetsCopied.push(cab);

            // TODO: should we be deleting instead?
            this.removeCabinet(selectedCabs[id]);
        }, this);

        this.redrawCanvas();
    },

    copyCabinets: function() {
        if (this.debug > 1) console.log("DCLayout::copyCabinets()");

        var selectedCabs = this.getSelectedObjects('cabinet');

        this.hashIterate(selectedCabs, function(id) {
            this.cabinetsCopied.push(selectedCabs[id]);
        }, this);

        if (this.debug > 2) console.log(this.cabinetsCopied.length + " cabinets copied");
    },

    pasteCabinets: function() {
        if (this.debug > 1) console.log("DCLayout::pasteCabinets()");

        var cr, cabinet, crs = this.cabinetsCopied;
        var me = this;

        this.unselectObjects('cabinet');
        for (var i = 0; i < crs.length; i++) {
            cr = crs[i];
            cabinet = new ACDC.Cabinet({
                id: 0,
                name: cr.name,
                type: cr.type,
                ctId: cr.ctId,
                locationId: cr.locationId,
                ctName: cr.ctName,
                ctType: cr.ctType,
                ctImageName: cr.ctImageName,
                image: cr.image,
                imageLoaded: cr.imageLoaded,
                site: cr.site,
                x: cr.x + (this.mouse.x - cr.x),
                y: cr.y + (this.mouse.y - cr.y),
                ctx: this.canvasBufferCtx,
                canvas: this.canvasBuffer,
                imagesDir: this.imagesDir
            });
            this.selectObject(cabinet);
            cabinet.save(function(cabinet) {
                var  x= 1;
                //this.objects.cabinet.all[cabinet.getId()] = cabinet;
            }, me);
        }
        this.redrawCanvas();
    },

    deleteCabinets: function() {
        if (this.debug > 1) console.log("DCLayout::deleteCabinets()");

        var i,
            cabinets = [],
            selectedCabinets = this.getSelectedObjects('cabinet'),
            nonEmptyCabinets = [];

        if (selectedCabinets.length > 0) {

            this.hashIterate(selectedCabinets, function(id, nonEmptyCabinets) {
                // check if there are assets still in this cabinet
                if (selectedCabinets[id].numAssets > 0) {
                    nonEmptyCabinets.push(selectedCabinets[id].name);
                }
            }, this, nonEmptyCabinets);

            if (nonEmptyCabinets.length > 0) {
                // we found some cabinets that are not empty
                Ext.Msg.alert(
                    'Error',
                    "Assets still exist in the following cabinets: " + nonEmptyCabinets.join(',') +
                        ". You must remove all assets in a cabinet before it can be deleted."
                );
            } else {
                this.hashIterate(selectedCabinets, function(id, cabinets) {
                    cabinets.push(selectedCabinets[id].name);
                }, this, cabinets);

                Ext.Msg.show({
                    title: 'Delete Cabinet?',
                    msg: 'Are you sure you want to delete the following cabinets: ' + cabinets.join(',') + '?',
                    buttons: Ext.Msg.YESNO,
                    scope: this,
                    fn: function(button) {
                        var cabinet;
                        if (button === 'yes') {
                            this.hashIterate(selectedCabinets, function(id) {
                                cabinet = selectedCabinets[id];
                                this.unselectObject(cabinet);
                                this.unhighlightObject(cabinet);
                                this.objects.cabinet.all.splice(cabinet.getId(), 1);
                                cabinet.remove();
                            }, this);
                            this.redrawCanvas.defer(1000, this);
                        }
                    }
                });
            }

        }
    },

    insertCabinet: function(imageIndex) {
        if (this.debug > 1) console.log("DCLayout::insertCabinet()");

        var image = this.images[imageIndex],
            rec = {
                id: 0,
                name: "New",
                locationId: this.currentLocationId,
                ctId: imageIndex,
                ctName: image.name,
                ctType: image.type,
                ctImageName: image.imageName,
                ctLength: image.length,
                ctWidth: image.width,
                image: image.img,
                imageLoaded: true,
                ctx: this.canvasBufferCtx,
                canvas: this.canvasBuffer,
                imagesDir: this.imagesDir,
                x: 0,
                y: 0
            },
            cabinet;

        cabinet = this.addCabinet(rec);
        cabinet.save(function(cabinet) {
            this.objects.cabinet.all[cabinet.getId()] = cabinet;
        }, this);
        this.unselectObjects('cabinet');
        this.selectObject(cabinet);

        this.dragStart();
    },

    editName: function(e) {
        if (this.debug > 1) console.log("DCLayout::editName()");
        var m = this.getMousePosition(e),
            cab = this.getObjectAtMouse(m);

        if (cab && cab.getObjectType() === 'cabinet') {
            Ext.Msg.prompt('Cabinet Name', 'Cabinet name:', function(btn, text) {
                var found = false,
                    cabs = this.getObjects('cabinet'),
                    m = this.getMousePosition(e);

                if (btn == 'ok') {
                    // check to be sure that this cabinet doesn't already exist
                    for (var id in cabs) {
                        if (cabs.hasOwnProperty(id)) {
                            if (cabs[id].name === text) found = true;
                        }
                    }

                    if (found) {
                        Ext.Msg.alert("Edit Cabinet Name", "Cabinet " + text + " already exists. Please choose a different name.");
                    } else {
                        cab.name = text;
                        cab.save();
                        this.redrawCanvas();
                    }
                }
            }, this, false, cab.name);
        }
    },

    editCabinetType: function(e) {
        if (this.debug > 1) console.log("DCLayout::editName()");

        var m = this.getMousePosition(e),
            cab = this.getObjectAtMouse(m),
            form,
            win;

        if (!cab) {
            return;
        }

        form = new Ext.form.FormPanel({
            //border: false,
            layout: 'form',
            frame: true,
            labelWidth: 100,
            defaultType: 'textfield',
            monitorValid: true,
            items: [
                {
                    xtype: 'combo',
                    label: 'Cabinet Type',
                    id: 'cabinetType',
                    name: 'cabinetType',
                    forceSelection: true,
                    triggerAction: 'all',
                    typeAhead: true,
                    hideTrigger: false,
                    minChars: 3,
                    mode: 'remote',
                    store: this.cabinetTypesStore,
                    valueField: 'id',
                    displayField: 'name',
                    width: 200
                }
            ],
            buttons: [
                {
                    text: 'Apply',
                    formBind: true,
                    scope: this,
                    handler: function() {
                        var cts = this.cabinetTypesStore,
                            items = cts.data.items,
                            rec,
                            cabId = Ext.getCmp("cabinetType").getValue();

                        for (var i = 0; i < items.length; i++) {
                            if (items[i].data.id == cabId) {
                                rec = items[i].data;

                                cab.ctId = rec.id;
                                cab.ctName = rec.name;
                                cab.ctType = rec.type;
                                cab.image = this.images[cabId].img;
                                cab.ctImageName = rec.imageName;
                                cab.ctLength = rec.length;
                                cab.ctWidth = rec.width;
                                cab.save();
                            }
                        }

                        this.redrawCanvas();
                        win.close();
                    }
                },
                {
                    text: 'Cancel',
                    handler: function() {
                        win.close();
                    }
                }
            ]
        });

        // create and show window
        win = new Ext.Window({
            title: 'Editing Cabinet Type',
            modal: true,
            constrain: true,
            width: 400,
            height: 200,
            layout: 'fit',
            closable: false,
            border: false,
            items: [
                form
            ]
        });

        win.show();
    },

    findCabinetById: function(id) {
        if (typeof this.objects.cabinet.all[id]) {
            return this.objects.cabinet.all[id];
        } else {
            return false;
        }
    },

    getCabinetElevation: function(cabinet, assetId) {
        this.fireEvent('showcabinetelevation', this, cabinet, assetId);
    },


    /* Drawing Methods */
    redrawCanvas: function() {
        if (this.debug > 1) console.log("DCLayout::redrawCanvas()");

        //this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //this.canvasBufferCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //noinspection SillyAssignmentJS
        this.canvasCtx.canvas.width = this.canvasCtx.canvas.width;
        //noinspection SillyAssignmentJS
        this.canvasBufferCtx.canvas.width = this.canvasBufferCtx.canvas.width;

        this.drawGrid();
        this.drawCabinets();
        this.drawLines();
        this.drawLocationNames();
        this.drawSelectRegion();

        this.canvasCtx.drawImage(this.canvasBuffer, 0, 0);
    },

    drawGrid: function() {
        if (this.debug > 1) console.log("DCLayout::drawGrid()");

        var spacing = this.gridSpacing[this.gridSpacingOpt];

        if (this.grid === false) return;

        this.canvasBufferCtx.save();
        this.canvasBufferCtx.beginPath();
        this.canvasBufferCtx.strokeStyle = "#AABBCC";
        this.canvasBufferCtx.lineWidth = 1.0;
        this.canvasBufferCtx.lineCap = 'butt';

        /* vertical lines */
        for (var x = 0; x <= this.canvas.width; x += spacing) {
            this.canvasBufferCtx.moveTo(0.5 + x, 0);
            this.canvasBufferCtx.lineTo(0.5 + x, this.canvas.height);
        }

        /* horizontal lines */
        for (var y = 0; y <= this.canvas.height; y += spacing) {
            this.canvasBufferCtx.moveTo(0, 0.5 + y);
            this.canvasBufferCtx.lineTo(this.canvas.width, 0.5 + y);
        }

        this.canvasBufferCtx.stroke();
        this.canvasBufferCtx.restore();
    },

    drawCabinets: function() {
        var cabinets = this.objects.cabinet.all;
        if (this.debug > 1) console.log("DCLayout::drawCabinets(" + Object.keys(cabinets).length + ")");
        for (var id in cabinets) {
            if (cabinets.hasOwnProperty(id)) {
                cabinets[id].draw(this.showUtilization, this.showExceptions);
            }
        }
    },

    drawLines: function() {
        var lines = this.objects.line.all;
        if (this.debug > 1) console.log("DCLayout::drawLines(" + Object.keys(lines).length + ")");
        for (var id in lines) {
            if (lines.hasOwnProperty(id)) {
                lines[id].draw();
            }
        }
    },

    drawLocationNames: function() {
        if (this.debug > 1) console.log("DCLayout::drawLocationNames()");
        this.canvasBufferCtx.save();
        this.canvasBufferCtx.font = '18pt Calibri';
        this.canvasBufferCtx.fillStyle = 'blue';
        this.canvasBufferCtx.fillText(this.location.name, 475, 21);
        this.canvasBufferCtx.restore();
    },

    drawSelectRegion: function() {
        if (this.debug > 1) console.log("DCLayout::drawSelectRegion()");
        var sr = this.selectRegion;

        if (!this.selecting) return;

        this.canvasBufferCtx.save();

        this.canvasBufferCtx.strokeStyle = "#00f";
        this.canvasBufferCtx.lineWidth = 2;

        if (this.debug > 2) console.log("DCLayout::drawSelectRegion(): " + sr.x + ", " + sr.y + ", " + sr.width + ", " + sr.height);

        this.canvasBufferCtx.strokeRect(
            sr.x, sr.y,
            sr.width, sr.height);

        this.canvasBufferCtx.restore();
    },

    printCanvas: function() {
        if (this.debug > 1) console.log("DCLayout::printCanvas()");
        var img = this.canvas.toDataURL("image/png");
        document.write('<img src="' + img + '"/>');
    },


    isMouseOnCabinet: function(m) {
        var cabinets = this.objects.cabinet.all;
        if (this.debug > 2) console.log("DCLayout::isMouseOnCabinet()");

        for (var id in cabinets) {
            if (cabinets.hasOwnProperty(id)) {
                if (cabinets[id].isHighlighted()) return true;
            }
        }
        return false;
    },

    isMouseOnSelectedCabinet: function(m) {
        var cabinets = this.objects.cabinet.selected;
        if (this.debug > 2) console.log("DCLayout::isMouseOnSelectedCabinet()");

        for (var id in cabinets) {
            if (cabinets.hasOwnProperty(id)) {
                if (cabinets[id].isHighlighted()) return true;
            }
        }
        return false;
    },

    isMouseInSelectRegion: function(m) {
        if (this.debug > 2) console.log("DCLayout::isMouseInSelectRegion()");

        var sr = this.selectRegion;
        return m.x >= sr.x && m.x <= sr.x + sr.width && m.y >= sr.y && m.y <= sr.y + sr.height;
    },

    getObjectAtMouse: function(m) {
        if (this.debug > 2) console.log("DCLayout::getObjectAtMouse()");
        var objects = this.getObjects('all');

        for (var id in objects) {
            if (objects.hasOwnProperty(id)) {
                if (objects[id].isHighlighted()) return objects[id];
            }
        }
        return null;
    },

    highlightObjectUnderMouse: function(m) {
        //if (this.debug > 2) console.log("DCLayout::highlightObjectUnderMouse()");
        var mouseOverObject = null,
            objects = this.getObjects('all');

        this.hashIterate(objects, function(id, m) {
            this.mouseOverObject(m, objects[id]);
        }, this, m);
        if (this.canvasDirty) this.redrawCanvas();
    },

    mouseOverObject: function(m, object) {
        //if (this.debug > 2) console.log("DCLayout::mouseOverObject()");
        if (this.isMouseOverObject(m, object)) {
            this.highlightObject(object);
        } else {
            this.unhighlightObject(object);
        }
    },

    isMouseOverObject: function(m, object) {
        //if (this.debug > 2) console.log("DCLayout::isMouseOverObject()");
        return object.contains(m);
    },


    /* Mouse Events */
    /**
     * The following are all possible use cases for this event; we need to be able test for and
     * handle each of these
     * 1. clicking on a cabinet
     * 2. starting to drag a cabinet
     * 3. starting to select a group
     * 4. starting to drag a xgroup
     * 5. clicking outside of anything: unselect all
     * 6. clicking to place a new object (insert)
     * 7. clicking to start a line draw (this.drawingLine = true)
     */
    onMouseDown: function(e) {
        if (this.debug > 2) console.log("DCLayout::onMouseDown()");

        var c,
            o = null,
            m = this.getMousePosition(e),
            cabinetsSelected = Object.keys(this.objects.cabinet.selected).length > 1,
            selectedCabs;

        /* Use Case: 6 - clicking to place a new cabinet */
        if (this.dragging) {
            this.dragEnd();
            return;
        }

        // if right-button, then return. content menu is called
        if (e.button === 2) {
            this.mouse = m;
            return;
        }

        /* Use Case: 4 - starting to drag a group */
        if (cabinetsSelected && this.isMouseOnSelectedCabinet(m)) {
            selectedCabs = this.getSelectedObjects('cabinet');

            if (this.debug > 2) console.log("DCLayout::drag selection");

            // flag that this is a group drag
            this.groupDrag = true;

            // note the offset of each cabinet to the initial mouse down x,y
            this.hashIterate(selectedCabs, function(id, m) {
                c = selectedCabs[id];
                c.selectX = c.x;
                c.selectY = c.y;
                this.grabX = m.x;
                this.grabY = m.y;
                if (this.debug > 2) console.log("DCLayout::cabinet: " + c.name + ", c.x: " + c.x + ", m.x: " + m.x);
            }, this, m);

            // no dragging allowed if not permitted for this user
            if (!this.editableByUser) {
                this.redrawCanvas();
                return;
            }

            // inititate the drag
            this.dragStart();
        }

        else {
            // no existing selection group, so unselect any currently selected objects
            this.unselectObjects('all');
            o = this.getObjectAtMouse(m);

            /* Use Case: 1 & 2 - clicking on a cabinet (click) or starting to drag an object */
            if (o) {
                // no dragging allowed if not permitted for this user
                if (!this.editableByUser) {
                    this.redrawCanvas();
                    return;
                }

                if (this.debug > 2) console.log("DCLayout::Drag object");
                this.selectObject(o);
                o.selectX = o.x1;
                o.selectY = o.y1;
                this.grabX = m.x;
                this.grabY = m.y;

                // check to see if the mouse is within the end stretch blocks of a line
                if (o.getObjectType() === 'line' && o.stretchEnd) {
                    if (o.stretchEnd === 1) {
                        o.selectX = o.x1;
                        o.selectY = o.y1;
                    } else if (o.stretchEnd === 2) {
                        o.selectX = o.x2;
                        o.selectY = o.y2;
                    }
                    this.stretchLine = true;
                }
                this.dragStart()
            }
            /* Use Case: 7 - being drawing a line */
            else if (this.drawingLine) {
                if (this.debug > 2) console.log("DCLayout::Drawing Line");
                this.drawLineStart(m);
            }
            /* Use Case: 3 & 5 - starting to select a group or not clicking on anything (click) */
            else {
                if (this.debug > 2) console.log("DCLayout::Selecting group");
                this.selectRegion.x = m.x;
                this.selectRegion.y = m.y;
                this.selectStart();
            }
        }
    },

    onMouseUp: function(e) {
        if (this.debug > 2) console.log("DCLayout::onMouseUp()");
    },

    // single click to show cabinet details
    onClick: function(e) {
        if (this.debug > 2) console.log("DCLayout::onClick()");

        if (!this.showDetailsOnClick) {
            this.showDetailsOnClick = true;
            return
        }

        var m = this.getMousePosition(e),
            objectAtCursor = this.getObjectAtMouse(m);

        if (this.debug > 2) console.log("DCLayout::objectAtCursor(" + (typeof objectAtCursor !== 'undefined' && objectAtCursor ? objectAtCursor.getObjectType() : 'null') + ")");
        if (objectAtCursor) {
            if (this.debug > 2) console.log("DCLayout::onClick(): if (objectAtCursor) = true");
            if (objectAtCursor.getObjectType() === 'cabinet') {
                this.unselectObjects('cabinet');
                this.selectObject(objectAtCursor);
                this.redrawCanvas();

                // don't show elevation for PDUs and STSs
                if (objectAtCursor.name.search(/^(PDU|STS)/) === -1) {
                    this.getCabinetElevation(objectAtCursor);
                }
            } else if (objectAtCursor.getObjectType() === 'line') {
                this.unselectObjects('cabinet');
                this.selectObject(objectAtCursor);
                this.redrawCanvas();
            }
            /*
        } else {
            this.unselectObjects('cabinet');
            this.unselectObjects('line');
            this.redrawCanvas();
            */
        }
    },

    onMouseMove: function(e) {
        if (this.debug > 2) console.log("DCLayout::onMouseMove");
        var m;
        if (this.dragging) return;

        m = this.getMousePosition(e);
        this.highlightObjectUnderMouse(m);

        if (this.canvasDirty) {
            this.redrawCanvas();
        }

        /*
         var m = this.getMousePosition(e),
         c = this.mouseOnCabinetExceptionMarker(m);

         if (c && c.hasExceptions) {
         if (!this.toolTipEl.cabId || c.id !== this.toolTipEl.cabId) {
         this.toolTipEl.dom.innerHTML = c.exceptionsHtml;
         this.toolTipEl.moveTo(m.x + 10, m.y + 50);
         this.toolTipEl.show();
         this.toolTipEl.displayed = true;
         this.toolTipEl.cabId = c.id;
         }
         } else {
         if (!this.cursorOnToolTip && this.toolTipEl.displayed) {
         this.hideToolTip.defer(800, this);
         }
         }
         */
    },

    getMousePosition: function(e) {
        if (this.debug > 2) console.log("DCLayout::getMousePosition()");

        var x, y, xAdj, yAdj, xScale, yScale, scrollLeft, scrollTop, xScroll, yScroll;
        var box = this.getBox();
        var canvasDiv = Ext.get('canvas-div');

        if (e.pageX != undefined && e.pageY != undefined) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        // adjust for header offset
        xAdj = x - this.offsetX;
        yAdj = y - this.offsetY;

        // adjust for scale
        /*
         * 1   -> 24,       48,       72,       96
         * 1.5 -> 36(-12),  72(-24), 108( -36), 144( -48)
         * 2   -> 48(-24),  96(-48), 144( -72), 192( -96)
         * 2.5 -> 60(-36), 120(-72), 180(-108), 240(-144)
         */
        xScale = xAdj - (xAdj - (xAdj / this.scale));
        yScale = yAdj - (yAdj - (yAdj / this.scale));

        scrollLeft = canvasDiv.parent().getScroll().left;
        scrollTop = canvasDiv.parent().getScroll().top;

        xScroll = xScale + (scrollLeft / this.scale);
        yScroll = yScale + (scrollTop / this.scale);

        xScroll = xScroll < 0 ? 0 : xScroll;
        yScroll = yScroll < 0 ? 0 : yScroll;

        if (this.debug > 2) console.log("DCLayout::getMousePosition(): x,y: " + x + "," + y + ";  adjust: " + xAdj + ", " + yAdj + ";  scale: " + xScale + "," + yScale + ";  scroll: " + scrollLeft + "," + scrollTop + ";  final: " + xScroll + "," + yScroll);

        return {
            x: xScroll,
            y: yScroll,
            rbuttonX: x < 0 ? 0 : x,
            rbuttonY: y + 100 < 0 ? 0 : y + 100
        };
    },

    hashIterate: function(list, fn, scope, args) {
        for (var id in list) {
            if (list.hasOwnProperty(id)) {
                fn.apply(scope, [id, args]);
            }
        }
    }


    /**
     * These functions are not used
     */
    /*
    onToolTipMouseOver: function() {
        this.cursorOnToolTip = true;
    },

    onToolTipMouseOut: function() {
        this.cursorOnToolTip = false;
    },

    hideToolTip: function() {
        if (!this.cursorOnToolTip && this.toolTipEl.displayed) {
            this.toolTipEl.hide();
            this.toolTipEl.displayed = false;
            this.toolTipEl.cabId = null;
        }
    },

    mouseOnCabinetExceptionMarker: function(m) {
        var r, x2, y2;
        for (var i = 0; i < this.cabinets.length; i++) {
            r = this.cabinets[i];
            x2 = r.x1 + ACDC.exceptionMarker.width - 2;
            y2 = r.y1 + ACDC.exceptionMarker.height;
            //console.log("DCLayout::m.xy=" + m.x + "," + m.y + " r.x1y1=" + r.x1 + "," + r.y1 + ", x2y2=" + x2 + "," + y2);
            if (m.x >= r.x1 - 2 && m.x <= x2 && m.y >= r.y1 && m.y <= y2) {
                //console.log("DCLayout::IN EXCEPTION MARKER")
                return r;
            }
        }
        return false;
    }

     cursorOnToolTip: function (m) {
     var tt = this.toolTipEl,
     x1 = tt.getX(),
     x2 = x1 + tt.getWidth(),
     y1 = tt.getY() - 50,
     y2 = y1 + tt.getHeight();

     //console.log("DCLayout::m.x=" + m.x + ",my=" + m.y + " x1=" + x1 + ",y1=" + y1 + ",x2=" + x2 + ",y2=" + y2);
     //console.log("DCLayout::x=" + this.toolTipEl.getX() + ", y=" + this.toolTipEl.getY());
     if (m.x >= x1 && m.x <= x2 && m.y >= y1 && m.y <= y2) {
     console.log(m.x + "," + m.y + " - cursor on tool tip");
     return true;
     } else {
     return false;
     }
     },

     onDblClick:  function (e) {
     var m = this.getMousePosition(e),
     c = this.getCabinetAtCursor(m),
     tt = this.toolTipEl,
     x1 = tt.getX(),
     x2 = x1 + tt.getWidth(),
     y1 = tt.getY(),
     y2 = y1 + tt.getHeight();

     //console.log("DCLayout::m.x=" + m.x + ",my=" + m.y + " x1=" + x1 + ",y1=" + y1 + ",x2=" + x2 + ",y2=" + y2);
     console.log("DCLayout::m.x=" + m.x + ", ttx1=" + x1);
     console.log("DCLayout::m.y=" + m.y + ", tty1=" + y1);
     }
     */

});


