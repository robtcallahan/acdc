/*******************************************************************************
 *
 * $Id: ConsoleLog.js 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/ConsoleLog.js $
 *
 *******************************************************************************
 */

Ext.namespace('ACDC');

// check to see if we have a console defined or not
if (typeof console == 'undefined') {
	var console = {};
	console.log = function(msg) {
		return;
	};
}

ACDC.ConsoleLog = function(message)
{
	if (!ACDC.debug) return;
	
	object = arguments[1] || "";
	
	var date = new Date();
	var timestamp = sprintf("%3s %02d %02d:%02d:%02d", 
		ACDC.months[date.getMonth()],
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds());
	
	if (typeof object === "object")
	{
		console.log(ACDC.DumpObj(object, "[" + timestamp + "] ACDC: " + message));
	}
	else
	{
		console.log("[" + timestamp + "] ACDC: " + message + " " + object);
	}
};

ACDC.DumpObj = function (obj, name, indent, depth) {
	if (typeof arguments[2] === "undefined")
		indent = "";
	if (typeof arguments[3] === "undefined")
		depth = 0;
	
	var MAX_DUMP_DEPTH = 10;

	if (depth > MAX_DUMP_DEPTH) {
		return indent + name + ": <Maximum Depth Reached>\n";		
	}
	
	if (typeof obj === "object") 
	{
		var child = null;	
		var output = indent + name + "\n";
		indent += "\t";
		
		for (var item in obj)
		{
			if (obj.hasOwnProperty(item) && item !== "argument")
			{
				try {
					child = obj[item];
					if (typeof child === "function") {
						child = "function()";
					}
				} catch (e) {
					child = "<Unable to Evaluate>";
				}
			
				if (typeof child === "object") {
					output += ACDC.DumpObj(child, item, indent, depth + 1);
				} else {
					output += indent + item + ": " + child + "\n";
				}
			}
		}
		return output;
	} 
	else 
	{
		return obj;
	}
}

