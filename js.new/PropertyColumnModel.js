/*******************************************************************************
 *
 * $Id: PropertyColumnModel.js 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/PropertyColumnModel.js $
 *
 *******************************************************************************
 */

// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.PropertyColumnModel = Ext.extend(Ext.grid.PropertyColumnModel, {
		// change default of 'Name' to 'Property' cause I like that better
		nameText: 'Property',
		valueText: 'Value',
		dateFormat: 'm/j/Y',
		trueText: 'true',
		falseText: 'false',
    
		constructor: function(grid, store)
		{
			var g = Ext.grid,
	        f = Ext.form;
	        
	        this.grid = grid;
	        g.PropertyColumnModel.superclass.constructor.call(this, [
	        		{header: this.nameText, width:50, sortable: false, dataIndex:'name', id: 'name', menuDisabled:true},
	        		{header: this.valueText, width:50, sortable: false, resizable:false, dataIndex: 'value', id: 'value', menuDisabled:true}
	        ]);
	        this.store = store;
	        
	        var bfield = new f.Field({
	        		autoCreate: {tag: 'select', children: [
	        				{tag: 'option', value: 'true', html: this.trueText},
	        				{tag: 'option', value: 'false', html: this.falseText}
	        		]},
	        		getValue: function(){
	        			return this.el.dom.value == 'true';
	        		}
	        });
	        
	        // turn off all select on focus thingies. Very annoying
	        this.editors = {
	        	date: new g.GridEditor(new f.DateField({selectOnFocus:false})),
	        	string: new g.GridEditor(new f.TextField({selectOnFocus:false})),
	        	number: new g.GridEditor(new f.NumberField({selectOnFocus:false, style:'text-align:left;'})),
	        	boolean: new g.GridEditor(bfield, {
	        			autoSize: 'both'
	        	})
	        };
	        this.renderCellDelegate = this.renderCell.createDelegate(this);
	        this.renderPropDelegate = this.renderProp.createDelegate(this);

	    },

	    // check to see if a custom editor is defined for the property. If so, return what the source did. 
	    // Else return false so no edits for you
		isCellEditable: function(colIndex, rowIndex)
		{
			var propName = this.grid.store.data.items[rowIndex].data.name;
			
			if (this.grid.customEditors[propName]) {
				return colIndex == 1;
			} else {
				return false;
			}
		},
		
        renderProp: function(val, meta, rec)
        {
        	var renderer = this.grid.customRenderers[rec.get('name')];
        	if(renderer){
        		return renderer.apply(this, [this.getPropertyName(val), meta, rec]);
        	}
        	return Ext.util.Format.htmlEncode(val);
        },

        getPropertyName : function(name){
            var pn = this.grid.propertyNames,
                editable = this.grid.editableProperties[name],
                propName = pn && pn[name] ? pn[name] : name;

           	if (editable) {
                return '<span class="ass-editable-property">' + propName + '</span>';
            } else {
                return propName;
            }
        }
});
