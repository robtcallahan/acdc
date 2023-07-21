/*******************************************************************************
 *
 * $Id: ErrorAlert.js 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ErrorAlert.js $
 *
 *******************************************************************************
 */

Ext.namespace('ACDC');

ACDC.ErrorAlert = function(msg, dataProxy, type, action, options, response, arg)
{
	var json = Ext.util.JSON.decode(response.responseText);
    var notify = new Ext.Notify({});
    var body = "";
	    
	Ext.MessageBox.buttonText.cancel = "Details";
	
	Ext.Msg.show({
			title:'ERROR',
			msg: msg,
			buttons: Ext.Msg.OKCANCEL,
			icon: Ext.MessageBox.ERROR,
			fn: function(buttonId) {
				if (buttonId == "cancel")
				{
					var html = "<div style='height:190; overflow:scroll;'><font style='font-family:arial; font-size:9pt'>";
					html += "<pre style='font-family:courier; font-size:8pt'>";
					html += "ERROR " + json.errorCode + ": " + json.errorText + "\n";
					html += "   in file: " + json.errorFile + "\n";
					html += "   at line: " + json.errorLine + "\n";
					html += "     stack: \n" + json.errorStack + "\n";
					if (typeof json.output != "undefined") {
						html += "    output: \n" + json.output;
					}
					html += "</pre>";
					html += "</font></div>";
					
					var detailsWin = new Ext.Window({
							title: "ERROR",
							modal: true,
							constrain: true,
							autoscroll: true,
							width: 700,
							height: 260,
							layout: 'form',
							items: [
								{
									xtype: 'panel',
									height: 240,
									width: 690,
									//autoScroll: true,
									buttonAlign: 'right',
									html: html
								}
							],
							buttons: [
								{
									text: 'Close',
									listeners: 
									{
										"click": function() {
											detailsWin.close();
											return;
										}
									}
								}, {
									text: 'Report Error',
									listeners: 
									{
										"click": function() {
											body = "";
											
											body += "ERROR " + json.errorCode + ": " + json.errorText + "\n";
											body += "   in file: " + json.errorFile + "\n";
											body += "   at line: " + json.errorLine + "\n";
											body += "     stack: \n" + json.errorStack;
											
											Ext.Ajax.request({
													url: 'php/send_email.php',
													params: 
													{
														'emailSubject': "ACDC Error Report",
														'emailBody': body
													},
													success: function(response, request) {
														var json = Ext.util.JSON.decode(response.responseText);
														
														if (json.returnCode == 0)
														{
															// let the user know that the email was successful
															notify.setAlert(notify.STATUS_INFO, "The Error Report has been sent to the website admin");
															detailsWin.close();
														}
														else
														{
															var msg = "An error has occurred.<br>The report could not be sent";
															ACDC.ErrorAlert(msg, null, null, null, null, response, null);
														}
													},
													failure: function(response, request) {
														Ext.Msg.show({
																title:'ERROR',
																msg: "An error has occurred:<br>" + response.statusText,
																buttons: Ext.Msg.OK,
																icon: Ext.MessageBox.ERROR
														});
													}
												});
										}
									}
								}
							]
					});
					detailsWin.show();
				}
			}
	});

	Ext.MessageBox.buttonText.cancel = "Cancel"; 
	
	// Always send an error report unless it's me
    /*
	if (ACDC.actor.userName == "rcallaha")
	{
		return;
	}
	*/
	
	body = [
		"Username: " + ACDC.actor.userName,
		"EMail: " + ACDC.actor.email,
		"ERROR " + json.errorCode + ": " + json.errorText,
		"   in file: " + json.errorFile,
		"   at line: " + json.errorLine,
		"     stack: \n" + json.errorStack,
		"output:\n" + json.output
	].join("\n");
	
	Ext.Ajax.request({
        url:     'php/send_feedback.php',
        method:  'POST',
        params:  {
            'emailFrom':    ACDC.actor.email,
            'emailSubject': "ACDC Error Report",
            'emailBody':    body
        },
        success: function (response, request) {
            var json = Ext.util.JSON.decode(response.responseText);

            if (json.returnCode == 0) {
                // let the user know that the email was successful
                notify.setAlert(notify.STATUS_INFO, "An Error Report has been sent to the website admin");
            }
        },
        failure: function (response, request) {
            // ignore failure
        }
    });
}

