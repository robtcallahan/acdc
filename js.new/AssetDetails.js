/*******************************************************************************
 *
 * $Id: AssetDetails.js 81566 2013-12-02 15:39:06Z rcallaha $
 * $Date: 2013-12-02 10:39:06 -0500 (Mon, 02 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81566 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/AssetDetails.js $
 *
 *******************************************************************************
 */

    // override the onUpdate method of PropertyStore so the cell is marked as dirty
    // by default PropertyGrid automatically commits changes so the cell will not be marked as dirty
Ext.override(Ext.grid.PropertyStore, {
    onUpdate: function (ds, record, type) {
        if (type == Ext.data.Record.EDIT) {
            var v = record.data['value'];
            var oldValue = record.modified['value'];
            if (this.grid.fireEvent('beforepropertychange', this.source, record.id, v, oldValue) !== false) {
                this.source[record.id] = v;
                // the commit is commented out so the field is marked as dirty
                //record.commit();
                this.grid.fireEvent('propertychange', this.source, record.id, v, oldValue);
            }
            else {
                record.reject();
            }
        }
    }
});

// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.AssetDetails = Ext.extend(Ext.grid.PropertyGrid, {
    numRUs: 44,

    row:        null,
    saveAction: ACDC.UPDATE,

    calledFrom: 'layout',
    rowIndex: null,

    actor: {
        accessCode: 0
    },

    assetSearchWindow:    null,
    assetSearchAddWindow: null,

    initComponent: function () {
        var boxMaxWidth = 390;


        this.addEvents(
            'beforepropertychange',
            'propertychange',
            'afterassetsave',
            'cancelassetedit',
            'showhistory',
            'assetloaded',
            'installasset',
            'addasset'
        );

        this.editableByUser = this.actor.accessCode >= 2;

        // Hidden properties
        this.assetProperties = {
            assetId:      '',  // mysql db asset table primary key
            sysId:        '',  // CMDB sys id
            sysClassName: '',  // CMDB sys class name
            isBlade:      0,   // 1 if blade, 0 if not
            source:       ''  // for Install function, the source of the data: existing 'cmdb' ci or 'new'
        };


        // define the properNames object which is required to change from the assetsGrid field names
        // to nicer looking names for the user
        this.propertyNames = {
            // Editable properties
            label:             "Label Name",  // physical label on the asset in the data center
            assetClass:        "Asset Class",   // translates CMDB sys class name to English text, eg., cmdb_ci_server => 'Server'
            deviceType:        "Device Type",

            location:          "Location",
            cabinet:           "Rack",
            elevation:         "Rack Elevation",
            numRUs:            "Number of Rack Units",

            serialNumber:      "Serial Number",
            assetTag:          "Asset Tag",
            manufacturer:      "Manufacturer",
            model:             "Model Number",

            state:            "State",
            powerStatus:       "Power Status",

            // Read only properties
            name:              "Name",

            cmdbLink:          "CMDB Link",    // hyperlink to the ServiceNow page of this asset
            installStatus:     "Install Status",
            environment:       "Environment",
            businessService:   "Business Service",
            subsystem:         "Subsystem",
            owningSuppMgr:     "Owning Support Manager",
            opsSuppGroup:      "Operations Support Group",
            sysAdminMgr:       "System Admin Manager",
            sysAdminGroup:     "System Admin Group",

            ipAddress:         "IP Address",
            memGB:             "RAM (GB)",
            cpuManufacturer:   "CPU Manufacturer",
            cpuType:           "CPU Type",
            cpuCount:          "CPU Count",
            cpuCoreCount:      "CPU Core Count",
            cpuSpeed:          "CPU Speed (GHz)",
            os:                "Operating System",
            osVersion:         "OS Version",
            osPatchLevel:      "OS Service Pack/Patch Level"
        };

        // specify which properties are editable
        this.editableProperties = {
            label:         1,
            assetClass:    1,
            deviceType:    1,
            location:      1,
            cabinet:       1,
            elevation:     1,
            numRUs:        1,
            serialNumber:  1,
            assetTag:      1,
            manufacturer:  1,
            model:         1,
            state:        1,
            powerStatus:   1
        };

        // standard property store
        this.store = new Ext.grid.PropertyStore(this);

        // custom property column model that changes header from Name to Property
        // turn off select on focus
        // changes isCellEditable to check for custom editor
        this.colModel = new ACDC.PropertyColumnModel(this, this.store);

        // combo used for the Install function
        this.assetSearchCombo = new ACDC.AssetSearchComboBox({
            id:          'asset-search-combo',
            hideTrigger: true,
            emptyText: 'Name, serial number or asset tag',
            fieldLabel:  'Asset',
            disabled:    false
        });


        // Define the combo box drop downs used for editing in Asset Details panel
        this.assetClassCombo = new Ext.form.ComboBox({
            id:            'asset-class-combo',
            boxMaxWidth:   boxMaxWidth,
            typeAhead:     true,
            triggerAction: 'all',
            lazyRender:    true,
            mode:          'local',
            forceSelection: true,
            store:         new Ext.data.ArrayStore({
                id:     0,
                fields: [
                    'sysClassName',
                    'displayText'
                ],
                data:   [
                    ['cmdb_ci_server', 'Host'],
                    ['cmdb_ci_netgear', 'Network Gear'],
                    ['cmdb_ci_msd', 'Storage'],
                    ['u_san_switches_storage', 'SAN Switch']
                ]
            }),
            //valueField: 'sysClassName',
            displayField:  'displayText',
            listeners:     {
                scope:  this,
                change: this.assetClassChange
            }
        });

        this.deviceTypeCombo = new ACDC.EditorComboBox({
            boxMaxWidth:   boxMaxWidth,
            itemName: 'deviceType',
            forceSelection: false,
            allowBlank:     true
        });

        this.locationCombo = new ACDC.EditorComboBox({
            itemName:  'location',
            boxMaxWidth:   boxMaxWidth,
            listeners: {
                scope:          this,
                locationchange: this.locationChange
            }
        });

        this.cabinetCombo = new ACDC.EditorComboBox({
            boxMaxWidth:   boxMaxWidth,
            itemName: 'cabinet'
        });

        this.manufacturerCombo = new ACDC.EditorComboBox({
            boxMaxWidth:   boxMaxWidth,
            itemName: 'manufacturer'
        });

        this.stateCombo = new ACDC.EditorComboBox({
            boxMaxWidth:   boxMaxWidth,
            itemName: 'state'
        });

        this.powerStatusCombo = new Ext.form.ComboBox({
            boxMaxWidth:   boxMaxWidth,
            id:            'power-status-combo',
            typeAhead:     true,
            triggerAction: 'all',
            lazyRender:    true,
            mode:          'local',
            forceSelection: true,
            store:         new Ext.data.ArrayStore({
                id:     0,
                fields: [
                    'id',
                    'value'
                ],
                data:   [
                    [0, 'ON'],
                    [1, 'OFF']
                ]
            }),
            displayField:  'value'
        });


        // define the custom editors for all editable fields
        this.labelEditor = new Ext.grid.GridEditor(
            new Ext.form.TextField({
                boxMaxWidth:   boxMaxWidth,
                id: 'label-text-field',
                stripCharsRe:  '/\s+/',
                selectOnFocus: true,
                allowBlank:    false,
                // allow only lowercase letters, numbers, dashes and dots
                regex:         new RegExp("^[A-Za-z0-9\._-]+$")
            }));

        this.assetClassEditor = new Ext.grid.GridEditor(this.assetClassCombo);
        this.deviceTypeEditor = new Ext.grid.GridEditor(this.deviceTypeCombo);

        this.locationEditor = new Ext.grid.GridEditor(this.locationCombo);
        this.cabinetEditor = new Ext.grid.GridEditor(this.cabinetCombo);
        this.elevationEditor = new Ext.grid.GridEditor(
            // allow only numbers between 1 and 44
            new Ext.form.NumberField({
                boxMaxWidth:   boxMaxWidth,
                id: 'elevation-text-field',
                minValue:      1,
                maxValue:      44,
                selectOnFocus: true,
                value:         1,
                allowNegative: false,
                allowDecimals: false,
                allowBlank:    false,
                listeners:     {
                    scope:  this,
                    change: function (field, newValue, oldValue) {
                        this.doLayout();
                    }
                }
            }));
        this.numRUsEditor = new Ext.grid.GridEditor(
            // allow only numbers between 1 and 44
            new Ext.form.NumberField({
                boxMaxWidth:   boxMaxWidth,
                id: 'numRUs-text-field',
                minValue:      1,
                maxValue:      44,
                selectOnFocus: true,
                value:         1,
                allowNegative: false,
                allowDecimals: true,
                allowBlank:    false
            }));

        this.serialNumberEditor = new Ext.grid.GridEditor(
            new Ext.form.TextField({
                boxMaxWidth:   boxMaxWidth,
                id: 'serialNumber-text-field',
                stripCharsRe:  '/\s+/',
                selectOnFocus: true,
                allowBlank:    false,
                // allow only uppercase letters, numbers and dashes
                regex:         new RegExp("^[A-Za-z0-9-]+$")
            }));
        this.assetTagEditor = new Ext.grid.GridEditor(
            new Ext.form.TextField({
                boxMaxWidth:   boxMaxWidth,
                id: 'assetTag-text-field',
                stripCharsRe:  '/\s+/',
                selectOnFocus: true,
                allowBlank:    false,
                // allow only uppercase letters and numbers
                regex:         new RegExp("^[A-Za-z0-9]+$")
            }));
        this.manufacturerEditor = new Ext.grid.GridEditor(this.manufacturerCombo);
        this.modelEditor = new Ext.grid.GridEditor(
            new Ext.form.TextField({
                boxMaxWidth:   boxMaxWidth,
                id: 'model-text-field',
                stripCharsRe:  '/\s+/',
                selectOnFocus: true,
                allowBlank:    false,
                // allow only letters, numbers, dashes, dots and spaces
                regex:         new RegExp("^[A-z0-9-\. ]+$")
            }));
        this.stateEditor = new Ext.grid.GridEditor(this.stateCombo);
        this.powerStatusEditor = new Ext.grid.GridEditor(this.powerStatusCombo);


        // assign the editors to the property names
        this.customEditors = {
            name:            {},
            label:           this.editableByUser ? this.labelEditor : {},
            assetClass:      this.editableByUser ? this.assetClassEditor : {},
            deviceType:      this.editableByUser ? this.deviceTypeEditor : {},

            location:        this.editableByUser ? this.locationEditor : {},
            cabinet:         this.editableByUser ? this.cabinetEditor : {},
            elevation:       this.editableByUser ? this.elevationEditor : {},
            numRUs:          this.editableByUser ? this.numRUsEditor : {},

            serialNumber:    this.editableByUser ? this.serialNumberEditor : {},
            assetTag:        this.editableByUser ? this.assetTagEditor : {},
            manufacturer:    this.editableByUser ? this.manufacturerEditor : {},
            model:           this.editableByUser ? this.modelEditor : {},
            state:          this.editableByUser ? this.stateEditor : {},
            powerStatus:     this.editableByUser ? this.powerStatusEditor: {},

            cmdbLink:        {},
            installStatus:   {},
            environment:     {},
            businessService: {},
            subsystem:       {},
            owningSuppMgr:   {},
            opsSuppGroup:    {},
            sysAdminMgr:     {},
            sysAdminGroup:   {},

            ipAddress:       {},
            memGB:           {},
            cpuManufacturer: {},
            cpuType:         {},
            cpuCount:        {},
            cpuCoreCount:    {},
            cpuSpeed:        {},
            os:              {},
            osVersion:       {},
            osPatchLevel:    {}
        };

        // define the custom renderers for all the properties. This method checks if there is a custom editor defined.
        // if not, it will add the x-item-disabled class to meta.css
        this.customRenderers = {};
        for (var name in this.propertyNames) {
            if (this.propertyNames.hasOwnProperty(name)) {
                this.customRenderers[name] = this.renderReadOnly;
            }
        }

        if (this.editableByUser) {
            for (name in this.editableProperties) {
                if (this.editableProperties.hasOwnProperty(name)) {
                    this.customRenderers[name] = this.renderEditable;
                }
            }
        }

        this.topToolbar = new Ext.Toolbar({
            items: [
                {
                    xtype:    'button',
                    id:       'asset-prop-save-button',
                    text:     'Save',
                    tooltip:  'Save your changes',
                    disabled: true,
                    scope:    this,
                    handler:  this.saveAsset
                },
                ' &nbsp; ',
                {
                    xtype:    'button',
                    id:       'asset-prop-cancel-button',
                    text:     'Cancel',
                    tooltip:  'Discard your changes',
                    disabled: false,
                    scope:    this,
                    handler:  this.cancelEdit
                },
                ' &nbsp; ',
                {
                    xtype:    'button',
                    id:       'asset-prop-install-button',
                    text:     'Install',
                    tooltip:  'Install a new asset',
                    disabled: false,
                    scope:    this,
                    handler:  this.installAsset
                },
                ' &nbsp; ',
                {
                    xtype:    'button',
                    id:       'asset-prop-add-button',
                    text:     'Add',
                    tooltip:  'Add an asset from CMDB that does not exist in ACDC',
                    disabled: false,
                    scope:    this,
                    handler:  this.addAsset
                },
                /*
                ' &nbsp; ',
                {
                    xtype:    'button',
                    id:       'asset-prop-decomm-button',
                    text:     'Decomm',
                    tooltip:  'Mark this asset as decommissioned',
                    hidden:   this.tablet,
                    disabled: false,
                    scope:    this,
                    handler:  this.decommAsset
                },
                */
                '->',
                {
                    xtype:    'button',
                    id:       'asset-prop-history-button',
                    text:     'History',
                    tooltip:  'Show asset history',
                    hidden:   this.tablet,
                    disabled: false,
                    scope:    this,
                    handler:  this.showHistory
                }
            ]
        });

        // apply config
        Ext.apply(this, {
            width: this.tablet ? 920 : 350,
            stripeRows: true,

            frame:  false,
            border: false,

            propertyNames: this.propertyNames,

            tbar: this.topToolbar,

            enableColumnHide: false,
            enableColumnMove: false,
            enableColumnResize: true,

            margins:    '0 0 0 0',
            //autoScroll: true,
            loadMask:   {
                msg: "Loading asset..."
            },

            bodyStyle: 'height: 100%',

            viewConfig: {
                forceFit: true
            }
        });

        // the rest is from ext with minor edits.
        this.customRenderers = this.customRenderers || {};

        this.propStore = this.store;
        this.cm = this.colModel;
        this.ds = this.store.store;

        // here we call Ext PropertyGrid superclass and not our own. We don't want to call
        // our own because it messes up our custom property model
        Ext.grid.PropertyGrid.superclass.initComponent.call(this);

        // copied from ext PropertyGrid source
        this.mon(this.selModel, 'beforecellselect', function (sm, rowIndex, colIndex) {
            if (colIndex === 0) {
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
            else {
                return true;
            }
        }, this);
    },

    afterRender: function() {
        ACDC.AssetDetails.superclass.afterRender.call(this);
    },

    showHistory: function (button, e) {
        var assetProps = this.assetProperties;
        this.fireEvent('showhistory', this, assetProps.assetId);
    },

    showAsset: function (assetId, isBlade) {
        var assetPanel = Ext.getCmp('asset-details-panel');
        if (assetPanel) {
            assetPanel.expand();
        }

        // set the save action to "update" which will be passed to the save_asset.php script
        this.saveAction = ACDC.UPDATE;

        this.loadMask.show('Loading asset...');

        Ext.Ajax.request({
            url:             'php/get_asset_details.php',
            params:          {
                assetId:   assetId,
                isBlade: typeof isBlade !== "undefined" ? isBlade : 0
            },
            scope:           this,
            mycallback:      function (json, options) {
                var data = json.data,
                    src = {},
                    prop;

                this.loadMask.hide();

                for (prop in this.assetProperties) {
                    if (this.assetProperties.hasOwnProperty(prop) && data.hasOwnProperty(prop)) {
                        this.assetProperties[prop] = data[prop];
                    }
                }
                // show elevation and numRUs even if null
                if (data.numRUs === null) {
                    data.numRUs = 0;
                }
                for (prop in this.propertyNames) {
                    if (this.propertyNames.hasOwnProperty(prop) && data.hasOwnProperty(prop)) {
                        src[prop] = data[prop];
                    }
                }

                if (isBlade) {
                    this.customEditors.label = {};
                    this.customEditors.assetClass = {};
                    this.customEditors.deviceType = {};

                    this.customEditors.location = {};
                    this.customEditors.cabinet = {};
                    this.customEditors.elevation = {};
                    this.customEditors.numRUs = {};

                    this.customEditors.serialNumber = {};
                    this.customEditors.assetTag = {};
                    this.customEditors.manufacturer = {};
                    this.customEditors.model = {};
                    this.customEditors.state = {};
                    this.customEditors.powerStatus = {};
                } else if (this.editableByUser) {
                    this.customEditors.label = this.labelEditor;
                    this.customEditors.assetClass = this.assetClassEditor;
                    this.customEditors.deviceType = this.deviceTypeEditor;

                    this.customEditors.location = this.locationEditor;
                    this.customEditors.cabinet = this.cabinetEditor;
                    this.customEditors.elevation = this.elevationEditor;
                    this.customEditors.numRUs = this.numRUsEditor;

                    this.customEditors.serialNumber = this.serialNumberEditor;
                    this.customEditors.assetTag = this.assetTagEditor;
                    this.customEditors.manufacturer = this.manufacturerEditor;
                    this.customEditors.state = this.stateEditor;
                    this.customEditors.powerStatus = this.powerStatusEditor;

                    this.deviceTypeCombo.store.baseParams.sysClassName = this.assetProperties.sysClassName;
                }

                this.setSource(src);
                this.cabinetCombo.store.baseParams['locationName'] = this.getSource().location;
                this.fireEvent('assetloaded', this, this.getSource().location, this.getSource().cabinet);


                if (data.hasOwnProperty('sysClassName') && data.sysClassName !== "") {
                    // add the sysClassName name to the deviceTypeCombo so that it's passed when the combo is activated
                    this.deviceTypeCombo.store.baseParams['sysClassName'] = data.sysClassName;
                    this.deviceTypeCombo.store.baseParams['query'] = "";
                    // force the deviceType store to load with the new params
                    this.deviceTypeCombo.store.load();
                }

            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    },

    locationChange: function (combo, newLocationName, oldLocationName) {
        if (newLocationName !== oldLocationName) {
            // add the location name to the cabinetCombo so that it's passed when the combo is activated
            this.cabinetCombo.store.baseParams['locationName'] = newLocationName;
            this.cabinetCombo.store.baseParams['query'] = "";
            // set the cabinet store to destroyed so that we force it to reload if the location changed
            this.cabinetCombo.store.load();
        }
    },

    assetClassChange: function (combo, newValue, oldValue) {
        var items = combo.store.data.items,
            data,
            sysClassName = "";

        if (newValue !== oldValue) {
            // get the value of the new item
            for (var i = 0; i < items.length; i++) {
                data = items[i].data;
                if (newValue === data.displayText) {
                    sysClassName = data.sysClassName;
                    break;
                }
            }
            if (sysClassName !== "") {
                this.assetProperties.sysClassName = sysClassName;

                // add the sysClassName name to the deviceTypeCombo so that it's passed when the combo is activated
                this.deviceTypeCombo.store.baseParams['sysClassName'] = sysClassName;
                this.deviceTypeCombo.store.baseParams['query'] = "";
                // force the deviceType store to load with the new params
                this.deviceTypeCombo.store.load();
            }
        }
    },

    clearData: function () {
        var src = {};

        for (var prop in this.propertyNames) {
            if (this.propertyNames.hasOwnProperty(prop)) {
                src[prop] = null;
            }
        }
        this.setSource(src);
    },

    hasChanges:     function () {
        return this.store.modified.length > 0;
    },

    // mark readonly fields by adding the x-item-disabled class which will make them look disabled
    renderReadOnly: function (value, metadata, record) {
        if (this.grid.customEditors[record.data.name]) {
            return value;
        }
        else {
            // no editor for this property; make it read-only-looking :-)
            metadata.css += "x-item-disabled";
            return value;
        }
    },

    renderEditable: function (value, metadata, record, rowIndex, colIndex, store) {
        if (value == 0) {
            metadata.css += "ass-invalid-value";
        } else {
            metadata.css += "ass-editable-property";
        }
        return value;
    },

    renderDate: function (value, metadata, record, rowIndex, colIndex, store) {
        if (value === null) {
            return "";
        }
        else if (typeof value !== "object") {
            return value;
        }
        else {
            return Ext.util.Format.date(value, "Y-m-d");
        }
    },

    onEditComplete: function (ed, value, startValue) {
        Ext.grid.PropertyGrid.superclass.onEditComplete.apply(this, arguments);
        var propName = ed.record.data.name,
            record = this.getStore().data.get(propName),
            newValue;

        if (value !== startValue) {
            if (propName === 'label') {
                newValue = value.toLowerCase();
            } else if (propName === 'assetTag') {
                newValue = value.toUpperCase();
            } else if (propName === 'serialNumber') {
                newValue = value.toUpperCase();
                this.checkSerialNumber(record, startValue, newValue)
                return;
            } else {
                newValue = value;
            }
            record.set('value', newValue);
            Ext.getCmp('asset-prop-save-button').enable();
        }
    },

    checkSerialNumber: function(record, oldValue, newValue) {
        Ext.Ajax.request({
            url: 'php/check_serial_number.php',
            params: {
                serialNumber: newValue
            },
            scope:           this,
            mycallback:      function (json, options) {
                var found = json.found,
                    label = json.label;

                if (found) {
                    Ext.Msg.show({
                        title: 'Duplicate Serial Number',
                        icon: Ext.MessageBox.ERROR,
                        msg: 'The serial number you entered already exists and is tied to ' + label,
                        buttons: Ext.Msg.OK,
                        scope: this,
                        fn: function(button) {
                            record.set('value', oldValue);
                            record.commit();
                        }
                    })
                } else {
                    record.set('value', newValue);
                    Ext.getCmp('asset-prop-save-button').enable();
                }
            }
        });
    },

    cancelEdit: function (button, e) {
        if (this.hasChanges()) {
            Ext.Msg.show({
                title:   'Cancel?',
                msg:     'Are you sure you want to discard your edits?',
                buttons: Ext.Msg.YESNO,
                scope:   this,
                fn:      function (button) {
                    if (button === 'yes') {
                        this.store.rejectChanges();
                        if (this.tablet) {
                            Ext.getCmp('asset-prop-save-button').disable();
                            Ext.getCmp('asset-prop-cancel-button').disable();
                        } else {
                            this.clearData();
                            this.fireEvent('cancelassetedit', this);
                        }
                    }
                }
            });
        }
        else {
            if (this.tablet) {
                Ext.getCmp('asset-prop-save-button').disable();
                Ext.getCmp('asset-prop-cancel-button').disable();
            } else {
                this.clearData();
                this.fireEvent('cancelassetedit', this);
            }
        }
    },

    installAsset: function () {
        var src = {},
            searchForm;

        this.fireEvent('installasset', this);

        for (var prop in this.propertyNames) {
            //noinspection JSUnfilteredForInLoop
            src[prop] = '';
        }
        this.setSource(src);

        if (this.assetSearchWindow === null) {
            searchForm = new Ext.form.FormPanel({
                layout:       'form',
                frame:        true,
                labelWidth:   130,
                defaultType:  'textfield',
                monitorValid: true,
                items:        [
                    {
                        xtype:    'label',
                        id:       'asset-form-label-1',
                        html:     'Enter an asset name string and wait for the search to be peformed. If the asset is found, select it and click "OK". ' +
                            'If the asset is not found, click the "Not Found" button.<br>',
                        cls:      'form-text',
                        disabled: false
                    },
                    this.assetSearchCombo,
                    {
                        xtype: 'label',
                        html:  '<br><br>'
                    },
                    {
                        xtype:    'label',
                        id:       'asset-form-label-2',
                        html:     'Enter the asset name in full FQND format and click "OK".<br>' +
                            'The string should be in lowercase and contain no spaces.',
                        cls:      'form-text',
                        disabled: true
                    },
                    {
                        xtype:      'textfield',
                        id:         'asset-name',
                        fieldLabel: 'Asset Name',
                        width:      200,
                        disabled:   true
                    }
                ],
                buttons:      [
                    {
                        text:     'OK',
                        formBind: true,
                        scope:    this,
                        handler:  function () {
                            var src = this.propStore.source,
                                assetProps = this.assetProperties,
                                comboItems = this.assetSearchCombo.store.data.items,
                                selectedItem,
                                match;

                            // asset doesn't exist in SN
                            if (Ext.getCmp('asset-name').getValue() !== '') {
                                var name = Ext.getCmp('asset-name').getValue().toLowerCase();

                                // check to be sure that an FQDN was entered
                                var re = /([a-z0-9\-]+)\.[a-z0-9\-]+\.[a-z0-9\-]+/;
                                if (!re.test(name) || /\s+/.test(name) || /\.$/.test(name)) {
                                    Ext.Msg.show({
                                        title:   'Error: Invalid FQDN',
                                        msg:     '"' + name + '" is an invalid FQDN.<br>Be sure that the name contains no spaces, ' +
                                            'has at least 2 dots and has no trailing dot.',
                                        buttons: Ext.Msg.OK,
                                        icon:    Ext.MessageBox.ERROR
                                    });
                                    return;
                                }
                                match = re.exec(name);

                                src.name = name;
                                src.label = match[1];
                                assetProps.source = 'new';

                                // enable the asset class editor pulldown for this new asset
                                //this.customEditors.assetClass = this.assetClassEditor;
                                //this.editableProperties.assetClass = 1;
                            }
                            // asset exists in CMDB
                            else {
                                assetProps.source = 'cmdb';

                                var json = comboItems[this.assetSearchCombo.selectedIndex].json;

                                // disable the asset class editor pulldown;
                                //this.customEditors.assetClass = {};
                                //this.editableProperties.assetClass = 0;

                                // define the name from the returned json
                                src.name = json.name;

                                for (prop in this.assetProperties) {
                                    if (this.assetProperties.hasOwnProperty(prop) && json.hasOwnProperty(prop)) {
                                        this.assetProperties[prop] = json[prop];
                                    }
                                }
                                // show elevation and numRUs even if null
                                if (json.numRUs === null) {
                                    json.numRUs = 0;
                                }
                                for (prop in this.propertyNames) {
                                    if (this.propertyNames.hasOwnProperty(prop) && json.hasOwnProperty(prop)) {
                                        src[prop] = json[prop];
                                    }
                                }

                                // set the state to Installed and power status to ON
                                src['state'] = 'Installed';
                                src['powerStatus'] = 'ON';

                                this.locationChange(this.cabinetCombo, this.getSource().location, "");
                                this.deviceTypeCombo.store.baseParams['sysClassName'] = this.assetProperties['sysClassName'];
                                this.deviceTypeCombo.store.baseParams['query'] = "";
                                this.deviceTypeCombo.store.load();
                            }
                            this.setSource(src);
                            this.saveAction = ACDC.INSTALL;
                            this.assetSearchWindow.hide();
                            var assetPanel = Ext.getCmp('asset-details-panel');
                            if (assetPanel) {
                                assetPanel.expand();
                            }
                        }
                    },
                    {
                        text:    'Not Found',
                        scope:   this,
                        handler: function () {
                            Ext.getCmp('asset-search-combo').disable();
                            Ext.getCmp('asset-form-label-1').disable();
                            Ext.getCmp('asset-name').enable();
                            Ext.getCmp('asset-form-label-2').enable();
                        }
                    },
                    {
                        text:    'Cancel',
                        scope:   this,
                        handler: function () {
                            this.assetSearchWindow.hide();
                        }
                    }
                ]
            });

            // create and show window
            this.assetSearchWindow = new Ext.Window({
                title:     'Asset Search',
                modal:     true,
                constrain: true,
                width:     600,
                height:    400,
                layout:    'fit',
                closable:  false,
                border:    false,
                items:     [
                    searchForm
                ],
                listeners: {
                    beforeclose: function () {
                        this.hide();
                        return false;
                    }
                }
            });
        }
        else {
            Ext.getCmp('asset-search-combo').enable();
            Ext.getCmp('asset-form-label-1').enable();
            Ext.getCmp('asset-name').setValue('');
            Ext.getCmp('asset-name').disable();
            Ext.getCmp('asset-form-label-2').disable();
        }

        this.assetSearchWindow.show();
    },

    addAsset: function () {
        var src = {},
            searchForm;

        this.fireEvent('addasset', this);

        for (var prop in this.propertyNames) {
            //noinspection JSUnfilteredForInLoop
            src[prop] = '';
        }
        this.setSource(src);

        if (this.assetSearchAddWindow === null) {
            searchForm = new Ext.form.FormPanel({
                layout:       'form',
                frame:        true,
                labelWidth:   130,
                defaultType:  'textfield',
                monitorValid: true,
                items:        [
                    {
                        xtype:    'label',
                        html:     'Enter an asset name string and wait for the search to be peformed. Then select it and click "OK".',
                        cls:      'form-text',
                        disabled: false
                    },
                    {
                        xtype: 'label',
                        html:  '<br><br>'
                    },
                    this.assetSearchCombo
                ],
                buttons:      [
                    {
                        text:     'OK',
                        formBind: true,
                        scope:    this,
                        handler:  function () {
                            var src = this.propStore.source,
                                assetProps = this.assetProperties,
                                comboItems = this.assetSearchCombo.store.data.items,
                                selectedItem,
                                json = comboItems[this.assetSearchCombo.selectedIndex].json;

                            for (prop in this.assetProperties) {
                                if (this.assetProperties.hasOwnProperty(prop) && json.hasOwnProperty(prop)) {
                                    this.assetProperties[prop] = json[prop];
                                }
                            }
                            // show elevation and numRUs even if null
                            if (json.numRUs === null) {
                                json.numRUs = 0;
                            }
                            for (prop in this.propertyNames) {
                                if (this.propertyNames.hasOwnProperty(prop) && json.hasOwnProperty(prop)) {
                                    src[prop] = json[prop];
                                }
                            }
                            this.locationChange(this.cabinetCombo, this.getSource().location, "");
                            this.deviceTypeCombo.store.baseParams['sysClassName'] = this.assetProperties['sysClassName'];
                            this.deviceTypeCombo.store.baseParams['query'] = "";
                            this.deviceTypeCombo.store.load();

                            // set the state to Installed and power status to ON
                            src['state'] = 'Installed';
                            src['powerStatus'] = 'ON';

                            this.setSource(src);
                            this.saveAction = ACDC.ADD;
                            this.assetSearchAddWindow.hide();
                            var assetPanel = Ext.getCmp('asset-details-panel');
                            if (assetPanel) {
                                assetPanel.expand();
                            }
                        }
                    },
                    {
                        text:    'Cancel',
                        scope:   this,
                        handler: function () {
                            this.assetSearchAddWindow.hide();
                        }
                    }
                ]
            });

            // create and show window
            this.assetSearchAddWindow = new Ext.Window({
                title:     'Asset Search',
                modal:     true,
                constrain: true,
                width:     600,
                height:    240,
                layout:    'fit',
                closable:  false,
                border:    false,
                items:     [
                    searchForm
                ],
                listeners: {
                    beforeclose: function () {
                        this.hide();
                        return false;
                    }
                }
            });
        }

        this.assetSearchAddWindow.show();
        Ext.getCmp('asset-search-combo').focus();
    },

    saveAsset: function (button, e) {
        var modifiedItems = this.store.modified,
            assetProps = this.assetProperties,
            src = this.propStore.source,
            changes = [],
            requiredFields;

        // create an object of the required fields. Install function has more requirements, because
        // we don't want to force some fields to be filled in on just an update
        requiredFields = {
            //name:      {name: 'Name', value: src.name},
            label:         {name: 'Label', value: src.label},
            assetClass:    {name: 'Asset Class', value: src.assetClass},
            deviceType:    {name: 'Device Type', value: src.deviceType},

            location:      {name: 'Location', value: src.location},
            cabinet:       {name: 'Cabinet', value: src.cabinet},
            elevation:     {name: 'Elevation', value: src.elevation},
            numRUs:        {name: 'Number of RUs', value: src.numRUs},

            serialNumber:  {name: 'Serial Number', value: src.serialNumber},
            assetTag:      {name: 'Asset Tag', value: src.assetTag},
            manufacturer:  {name: 'Manufacturer', value: src.manufacturer},
            model:         {name: 'Model Number', value: src.model},
            state:        {name: 'State', value: src.state},
            powerStatus:   {name: 'Power Status', value: src.powerStatus}
        };

        for (var i = 0; i < modifiedItems.length; i++) {
            changes.push({
                name:  modifiedItems[i].data.name,
                type:  "string",
                value: modifiedItems[i].data.value
            });
            if (assetProps.source === 'new' && modifiedItems[i].data.name === 'assetClass') {
                assetProps.assetClass = modifiedItems[i].data.value;
            }
        }

        // Check to be sure that all required fields are present
        var missingParams = [];
        for (var reqField in requiredFields) {
            if (requiredFields.hasOwnProperty(reqField) && requiredFields[reqField].value === "") {
                missingParams.push(requiredFields[reqField].name);
            }
        }

        var params = {
            action:       this.saveAction,
            name:         src.name,
            label:        src.label,
            sysId:        assetProps.sysId,
            sysClassName: assetProps.sysClassName,
            assetClass:   src.assetClass,
            deviceType:   src.deviceType,
            assetId:      assetProps.assetId,
            isBlade:      assetProps.isBlade,
            source:       assetProps.source,

            location:     src.location,
            cabinet:      src.cabinet,
            elevation:    src.elevation,
            numRUs:       src.numRUs,

            serialNumber: src.serialNumber,
            assetTag:     src.assetTag,
            manufacturer: src.manufacturer,
            model:        src.model,
            state:       src.state,
            powerStatus:  src.powerStatus,

            changes:      Ext.util.JSON.encode(changes)
        };

        if (missingParams.length > 0) {
            Ext.Msg.show({
                title:   'Error: Required fields missing',
                msg:     'The following fields are missing:<br>' + missingParams.join('<br>') + '<br><br>Do you want to save anyway?',
                buttons: Ext.Msg.YESNO,
                icon:    Ext.MessageBox.ERROR,
                scope: this,
                fn: function(button) {
                    if (button === "yes") {
                        this.ajaxSave(params, changes, modifiedItems);
                    }
                }
            });
        } else {
            this.ajaxSave(params, changes, modifiedItems);
        }
    },

    ajaxSave: function(params, changes, modifiedItems) {
        this.loadMask.show("Saving asset...");

        Ext.Ajax.request({
            url:             'php/save_asset.php',

            // passing the action and ticket id
            params:          params,
            modifiedItems:   modifiedItems,
            changes:         changes,
            scope:           this,
            mycallback:      function (json, options) {
                var modifiedItems = options.modifiedItems,
                    itemsLength = modifiedItems.length,
                    changes = options.changes,
                    newFromCmdb = json.newlyFoundInCmdb,
                    r = null;

                this.loadMask.hide();

                var silent = false;
                for (var i = 0; i < itemsLength; i++) {
                    // need to commit index 0 each time since the modifiedItems array is reduced each time a commit() is called
                    modifiedItems[0].commit(silent);
                }

                if (this.saveAction !== ACDC.INSTALL) {
                    this.fireEvent('afterassetsave', this, changes, params.assetId, newFromCmdb);
                }

                if (json.message !== "") {
                    this.notify.setAlert(this.notify.STATUS_INFO, json.message, 5);
                } else {
                    this.notify.setAlert(this.notify.STATUS_INFO, "Asset updated", 3);
                }

                Ext.getCmp('asset-prop-save-button').disable();
                this.saveAction = ACDC.UPDATE;

            },
            myerrorcallback: function (json, options, response) {
                this.loadMask.hide();
                ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
            }
        });
    }
});

