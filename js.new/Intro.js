/*******************************************************************************
 *
 * $Id: Intro.js 77404 2013-08-01 15:47:42Z rcallaha $
 * $Date: 2013-08-01 11:47:42 -0400 (Thu, 01 Aug 2013) $
 * $Author: rcallaha $
 * $Revision: 77404 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/Intro.js $
 *
 *******************************************************************************
 */

Ext.namespace('ACDC');
ACDC.Intro = Ext.extend(Ext.Panel, {

    initComponent: function () {
        Ext.apply(this, arguments);

        Ext.apply(this, {
            margins: '0 0 0 0',
            renderTo: document.body,
            html: '<canvas id="canvas-intro" style="background-color: #F2F6F6; height: 1000px;"></canvas>',
            bodyStyle: 'height: 100%; width: 100%'
        });

        ACDC.Intro.superclass.initComponent.apply(this, arguments);
    },

    afterRender:         function () {
        var box;
        this.doLayout();

        this.canvas = Ext.get("canvas-intro").dom;

        if (this.canvas && this.canvas.getContext) {
            box = this.getBox();

            this.canvas.width = box.width;
            this.canvas.height = box.height;

            this.canvasCtx = this.canvas.getContext("2d");

            this.offsetX = box.x;
            this.offsetY = box.y;

            this.canvasBuffer = document.createElement('canvas');
            this.canvasBuffer.width = this.canvas.width;
            this.canvasBuffer.height = this.canvas.height;
            this.canvasBufferCtx = this.canvasBuffer.getContext('2d');
        }
        this.getImages();
    },


    getImages: function () {
        Ext.Ajax.request({
            url:        'php/get_intro_images.php',
            params:     {
            },
            scope:      this,
            mycallback: function (json, options) {
                this.loadImages(json.data);
            },
            myerrorcallback: function (json, options, response) {
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    loadImages: function (data) {
        var numImages = data.length,
            loadedImages = 0,
            d,
            id;

        this.images = {};

        for (var i = 0; i < data.length; i++) {
            d = data[i];
            id = d.id;

            this.images[id] = {
                id:        d.id,
                imageName: d.imageName,
                length:    d.length,
                width:     d.width,
                imageFile: this.imagesDir + d.imageName,
                img:       new Image()
            };
            this.images[d.id].img.onload = function () {
                if (++loadedImages >= numImages) {
                    this.main();
                }
            }.bind(this);
            this.images[id].img.src = this.images[id].imageFile;
        }
    },

    main: function() {
        var img = this.images[1];

        /*
        this.canvasBufferCtx.font = '18pt Calibri';
        this.canvasBufferCtx.fillStyle = 'blue';
        this.canvasBufferCtx.fillText('ACDC', 25, 21);
        */

        this.drawImage(img.img, 100, 100, 100, 200).defer(1000, this);
        this.drawImage(img.img, 200, 200, 100, 200).defer(5000, this);
    },

    drawImage: function(img, x1, y1, x2, y2)
    {
        this.canvasBufferCtx.drawImage(img, x1, y1, x2, y2);
        this.redrawCanvas();
    },

    redrawCanvas:        function () {
        this.canvasCtx.drawImage(this.canvasBuffer, 0, 0);
    }
});


