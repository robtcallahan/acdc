/*******************************************************************************
 *
 * $Id: Constants.js 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/js/Constants.js $
 *
 *******************************************************************************
 */

// define the variable name space for the application classes
Ext.namespace('ACDC');

ACDC.debug = 0; // 0: none; 1: debug; 2: verbose; 3: very verbose

ACDC.exceptionMarker = {
    width: 10,
    height: 10
};

ACDC.UPDATE  = 'update';
ACDC.INSTALL = 'install';
ACDC.DECOMM  = 'decomm';
ACDC.ADD     = 'add';

ACDC.oneMilliSecond = 1;
ACDC.oneSecond = 1000 * ACDC.oneMilliSecond;
ACDC.oneMinute = 60   * ACDC.oneSecond;
ACDC.oneHour   = 60   * ACDC.oneMinute;
ACDC.oneDay    = 24   * ACDC.oneHour;

ACDC.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

ACDC.monthsFull = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];

ACDC.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

ACDC.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// define some global constant values

ACDC.confluenceURL = "https://confluence.nexgen.neustar.biz/display/IS/ACDC";

// cabinet utilization
ACDC.CABINETUTILOK = 0;
ACDC.CABINETUTILFULL = 1;
ACDC.CABINETUTILEMPTY = 2;