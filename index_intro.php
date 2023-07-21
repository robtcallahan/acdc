<?php
/*******************************************************************************
 *
 * $Id: index_intro.php 77404 2013-08-01 15:47:42Z rcallaha $
 * $Date: 2013-08-01 11:47:42 -0400 (Thu, 01 Aug 2013) $
 * $Author: rcallaha $
 * $Revision: 77404 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/index_intro.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/config/global.php";

try
{
	// config settings
	$config = $GLOBALS['config'];
}
catch (Exception $e)
{
	echo "<html><body><pre>";
	echo "Error " . $e->getCode() . ": " . $e->getMessage() . "\n";
	echo "  in file: " . $e->getFile() . "\n";
	echo "  at line: " . $e->getLine() . "\n";
	echo "    trace:\n" . $e->getTraceAsString() . "\n";
	echo "</pre></body></html>";
	exit;
}

?>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
  
    <title>ACDC</title>

    <link rel="stylesheet" type="text/css" href="/ext/resources/css/ext-all.css" />
    <link rel="stylesheet" type="text/css" href="/ext/resources/css/xtheme-slate.css" />

    <script type='text/javascript' src='/ext/adapter/ext/ext-base-debug.js'></script>
    <script type='text/javascript' src='/ext/ext-all-debug.js'></script>

    <script type='text/javascript' src='js/ExtOverrides.js'></script>
    <script type='text/javascript' src='js/Constants.js'></script>
    <script type='text/javascript' src='js/Helpers.js'></script>
    <script type='text/javascript' src='js/ErrorAlert.js'></script>
    <script type='text/javascript' src='js/Ajax.js'></script>
    <script type='text/javascript' src='js/Notify.js'></script>
    <script type='text/javascript' src='js/ConsoleLog.js'></script>
    <script type='text/javascript' src='js/Intro.js'></script>
    <script type='text/javascript' src='js/ACDCIntro.js'></script>

    <script type='text/javascript'>
        Ext.namespace('ACDC');
        ACDC.imagesDir = '<?=$config->imagesDir?>';
    </script>
</head>

<body>
</body>
</html>

