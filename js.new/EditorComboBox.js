/*******************************************************************************
 *
 * $Id: EditorComboBox.js 80341 2013-10-25 14:05:03Z rcallaha $
 * $Date: 2013-10-25 10:05:03 -0400 (Fri, 25 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80341 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/EditorComboBox.js $
 *
 *******************************************************************************
 */

    // define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.EditorComboBox = Ext.extend(Ext.form.ComboBox, {

    forceSelection: true,
    allowBlank:     false,

    initComponent: function ()
    {
        Ext.apply(this, arguments);

        this.addEvents(
            'locationchange'
        );

        this.store = new Ext.data.Store({
            baseParams: {
                itemName: this.itemName
            },
            proxy:      new Ext.data.HttpProxy(
                {
                    url:        'php/get_asset_combo_items.php'
                }),
            reader:     new Ext.data.JsonReader(
                {
                    root:          'items',
                    totalProperty: 'total'
                }, [
                    {name: 'id', type: 'string'},
                    {name: 'name', type: 'string'}
                ]),
            listeners: {
                scope: this,
                load:  function (store, records, options) {
                    var x = 1;
                }
            }
        });

        // overriding loadRecord to comment out the first section since the cabinet combo box was not being loaded
        //
        this.store.loadRecords =  function(o, options, success){
            /*
             if (this.isDestroyed === true) {
             return;
             }
             */
            if (!o || success === false) {
                if (success !== false) {
                    this.fireEvent('load', this, [], options);
                }
                if (options.callback) {
                    options.callback.call(options.scope || this, [], options, false, o);
                }
                return;
            }
            var r = o.records, t = o.totalRecords || r.length;
            if (!options || options.add !== true) {
                if (this.pruneModifiedRecords) {
                    this.modified = [];
                }
                for (var i = 0, len = r.length; i < len; i++) {
                    r[i].join(this);
                }
                if (this.snapshot) {
                    this.data = this.snapshot;
                    delete this.snapshot;
                }
                this.clearData();
                this.data.addAll(r);
                this.totalLength = t;
                this.applySort();
                this.fireEvent('datachanged', this);
            } else {
                this.totalLength = Math.max(t, this.data.length + r.length);
                this.add(r);
            }
            this.fireEvent('load', this, r, options);
            if (options.callback) {
                options.callback.call(options.scope || this, r, options, true);
            }
        }

        Ext.apply(this, {
            //id: this.itemName,
            autoDestroy: false,
            name:           this.itemName,
            mode:           'remote',
            typeAhead:      true,
            selectOnFocus:  true,
            triggerAction:  'all',
            lazyRender:     true,
            minChars:       2,
            queryDelay:     1000,
            store:          this.store,
            //valueField:     'id',
            displayField:   'name',
            listeners:      {
                scope:  this,
                select: function (combo) {
                    this.triggerBlur();
                },
                change: function(combo, newValue, oldValue) {
                    if (combo.itemName === "location") {
                        this.fireEvent('locationchange', this, newValue, oldValue)
                    }
                },
                load: function() {
                    var x = 1;
                }
            }
        });

        ACDC.EditorComboBox.superclass.initComponent.apply(this, arguments);
    }
});

