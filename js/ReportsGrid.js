// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.ReportsGrid = Ext.extend(Ext.grid.GridPanel, {
    selectedReport: 'floorTileUtil',

    initComponent: function () {
        Ext.apply(this, arguments);

        this.reportsMeta = {
            floorTileUtil: {
                title: 'Floor Tile Util by Location',
                id:    'select-report-floorTileUtil'
            },
            ruReservations: {
                title: 'RU Reservations',
                id:    'select-report-ruReservations'
            }
        };

        this.readers = [];
        this.readers['floorTileUtil'] = new Ext.data.JsonReader(
            {
                root:          'grid',
                totalProperty: 'total'
            }, [
                {name: 'locationName',        type: 'string'},
                {name: 'usedTiles',           type: 'int'},
                {name: 'unusedTiles',         type: 'string'},
                {name: 'totalTiles',          type: 'int'},
                {name: 'comments',            type: 'string'}
            ]);
        this.readers['ruReservations'] = new Ext.data.JsonReader(
            {
                root:          'grid',
                totalProperty: 'total'
            }, [
                {name: 'locationName',        type: 'string'},
                {name: 'projectName',         type: 'string'},
                {name: 'businessService',     type: 'string'},
                {name: 'cabinetName',         type: 'string'},
                {name: 'elevation',           type: 'int'},
                {name: 'numRUs',              type: 'int'},
                {name: 'assetName',           type: 'string'},
                {name: 'model',               type: 'string'},
                {name: 'serialNumber',        type: 'string'},
                {name: 'assetTag',            type: 'string'},
                {name: 'estimatedInstallDate',type: 'date', dateFormat: 'Y-m-d'}
            ]);


        this.stores = [];
        for (var report in this.reportsMeta) {
            if (this.reportsMeta.hasOwnProperty(report)) {
                this.stores[report] = new Ext.data.Store({
                    proxy:    new Ext.data.HttpProxy({
                        url: 'php/get_report.php'
                    }),
                    baseParams: {
                        reportType: report
                    },
                    remoteSort: true,
                    reader:     this.readers[report],
                    listeners:  {
                        scope: this,
                        load:  this.updateHeader
                    }
                });
            }
        }

        // define the column model for the grid
        this.colModels = [];
        this.colModels['floorTileUtil'] = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                width:    90,
                align:    'right'
            },
            columns:  [
                {
                    header:    "Location",
                    dataIndex: 'locationName',
                    align: 'left',
                    width:     200
                }, {
                    header: "Number of Tiles",
                    dataIndex: 'totalTiles',
                    width: 120
                }, {
                    header:    "Used Tiles",
                    dataIndex: 'usedTiles',
                    width:     120
                }, {
                    header:    "Available Tiles",
                    dataIndex: 'unusedTiles',
                    width:     120
                }, {
                    header: "Comments",
                    dataIndex: 'comments',
                    width: 400,
                    align: "left"
                }
            ]
        });
        this.colModels['ruReservations'] = new Ext.grid.ColumnModel({
            defaults: {
                sortable: false,
                width:    90,
                align:    'left'
            },
            columns:  [
                {
                    header:    "Location",
                    dataIndex: 'locationName',
                    width:     200
                }, {
                    header:    "Project Name",
                    dataIndex: 'projectName',
                    width:     200
                }, {
                    header:    "Est Install Date",
                    dataIndex: 'estimatedInstallDate',
                    width:     120,
                    renderer: Ext.util.Format.dateRenderer("Y-m-d")
                }, {
                    header:    "Business Service",
                    dataIndex: 'businessService',
                    width:     200
                }, {
                    header:    "Cabinet Name",
                    dataIndex: 'cabinetName',
                    width:     100
                }, {
                    header:    "Elevation",
                    dataIndex: 'elevation',
                    width:     80
                }, {
                    header:    "Num RUs",
                    dataIndex: 'numRUs',
                    width:     80
                }, {
                    header:    "Asset Name",
                    dataIndex: 'assetName',
                    width:     120
                }, {
                    header:    "Model",
                    dataIndex: 'model',
                    width:     120
                }, {
                    header:    "Serial Number",
                    dataIndex: 'serialNumber',
                    width:     100
                }, {
                    header:    "Asset Tag",
                    dataIndex: 'assetTag',
                    width:     100
                }
            ]
        });

        this.toolbar = new Ext.Toolbar({
            items: [
                {
                    text: ' File &nbsp; ',
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                text:    'Export',
                                tooltip: 'Export report to Excel',
                                iconCls: 'export',
                                handler: this.exportExcel,
                                scope:   this
                            }
                        ]
                    }
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    text: ' Report &nbsp; ',
                    menu: {
                        xtype: 'menu',
                        plain: true,
                        items: [
                            {
                                xtype:     'menucheckitem',
                                text:      this.reportsMeta.floorTileUtil.title,
                                id:        this.reportsMeta.floorTileUtil.id,
                                checked:   (this.selectedReport === "floorTileUtil"),
                                group:     'report-type',
                                listeners: {
                                    scope: this,
                                    click: this.onReportCheck
                                }
                            },
                            {
                                xtype:     'menucheckitem',
                                text:      this.reportsMeta.ruReservations.title,
                                id:        this.reportsMeta.ruReservations.id,
                                checked:   (this.selectedReport === "ruReservations"),
                                group:     'report-type',
                                listeners: {
                                    scope: this,
                                    click: this.onReportCheck
                                }
                            }
                        ]
                    }
                },
                '->',
                {
                    xtype: 'tbtext',
                    id:    'report-title',
                    text:  'Floor Tile Util by Location',
                    cls:   'report-title'
                }
            ]
        });

        Ext.apply(this, {
            trackMouseOver: true,
            stripeRows:     true,
            autoScroll:     true,
            columnLines:    true,
            enableHdMenu:   false,
            loadMask:       {
                msg: "Loading..."
            },
            tbar:           this.toolbar,
            colModel:       this.colModels[this.selectedReport],
            store:          this.stores[this.selectedReport]
        });

        // call parent
        ACDC.ReportsGrid.superclass.initComponent.apply(this, arguments);
    },

    updateHeader: function() {
        Ext.get('report-title').dom.innerHTML = this.reportsMeta[this.selectedReport].title;
    },

    onReportCheck: function (item, e) {
        if (e !== null) e.stopEvent();
        var index = item.id.replace(/select-report-/, '');
        Ext.get('report-title').dom.innerHTML = this.reportsMeta[index].title;

        this.reconfigure(this.stores[index], this.colModels[index]);
        this.stores[index].load();
        this.selectedReport = index;
    },

    exportExcel: function (item, e) {
        // create the form in HTML
        var win,
            task,
            html;

        e.stopEvent();

        html = "<span class='csv-message'>Generating MicroSquish Excel file...</span>\n" +
               "<form name='exportForm' id='exportForm' method='post' action='php/export_report.php'>\n" +
                   "<input type='hidden' name='reportType' value='" + this.selectedReport + "'>\n" +
               "</form>\n";

        // open a window and submit the form
        win = new Ext.Window({
            modal:      true,
            constrain:  true,
            height:     60,
            width:      200,
            autoScroll: true,
            items:      [
                {
                    html: html
                }
            ]
        });
        win.render(document.body);
        win.center();
        win.show();

        task = new Ext.util.DelayedTask();
        task.delay(2000, this.submitExportForm, this, [win]);
    },

    submitExportForm: function (win) {
        Ext.get('exportForm').dom.submit();
        win.close();
    }
});
