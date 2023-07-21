/*******************************************************************************
 *
 * @class TicketsGrid
 * @extends Ext.grid.GridPanel
 *
 * TicketsGrid description_here
 *
 * $Id: Ajax.js 81550 2013-12-02 03:37:06Z rcallaha $
 * $Date: 2013-12-01 22:37:06 -0500 (Sun, 01 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81550 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/Ajax.js $
 *
 *******************************************************************************
 */

Ext.Ajax.timeout = 5 * ACDC.oneMinute;
Ext.Ajax.method = "POST";

Ext.Ajax.on('requestcomplete', 
	function(conn, response, options)
	{
		var scope = options.myscope || options.scope || this,
		    dataType = options.dataType || options.params && options.params.dataType || "json",
		    json;
		
		if (typeof options.isUpload !== "undefined" && options.isUpload)
		{
			return;
		}

		else if (dataType === "storemenu" || dataType === "treegrid")
		{
			json = Ext.util.JSON.decode(response.responseText);
			if (typeof json.returnCode !== "undefined" && json.returnCode !== 0)
			{
				ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
			}
		}
				
        else if (dataType === "html")
        {
        	if (typeof options.mycallback !== "undefined") {
        		options.mycallback.call(scope, response.responseText);
        	}
        }
        
		else
		{
			// decode the returned JSON
			json = Ext.util.JSON.decode(response.responseText);

			// did we return success? 0 = success
			if (json.returnCode === 0) 
			{
				if (typeof options.mycallback !== "undefined")
				{
					options.mycallback.call(scope, json, options);
				}
			}
			else if (json.returnCode === 1 && typeof options.myerrorcallback !== "undefined") 
			{
				options.myerrorcallback.call(scope, json, options, response);
			}
			else if (json.returnCode === 1 && typeof json.userMessage !== "undefined")
			{
				if (typeof options.maskedEl !== "undefined")
				{
					options.maskedEl.unmask();
				}
				
				Ext.Msg.show({
						title:'ERROR',
						msg: "An error has occurred:<br>" + json.userMessage,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
				});
			}
			else
			{
				if (typeof options.maskedEl !== "undefined")
				{
					options.maskedEl.unmask();
				}
				
				ACDC.ErrorAlert(json.errorText, null, null, null, null, response, null);
			}
		}
	});

Ext.Ajax.on('requestexception', 
	function(conn, response, options)
	{
		Ext.Msg.show({
				title:'ERROR',
				msg: "An error has occurred:<br>" + response.status + ": " + response.statusText,
				buttons: Ext.Msg.OK,
				icon: Ext.MessageBox.ERROR
		});
		ACDC.ConsoleLog("server response", response);
	});

