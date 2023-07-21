<?php
/*******************************************************************************
 *
 * $Id: show_exception_report.php 79857 2013-10-14 19:44:45Z rcallaha $
 * $Date: 2013-10-14 15:44:45 -0400 (Mon, 14 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79857 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/show_exception_report.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\HPSIM\HPSIMBladeTable;
use STS\HPSIM\HPSIMChassisTable;

try 
{
	$config = $GLOBALS['config'];

	$reportType = $_GET['reportType'];

    switch ($reportType) {
        case 'assetsNotFound':
            $command = "ls -t {$config->logDir}/acdc_cmdb_lookup.log.* | head -1";
            $logFile = rtrim(shell_exec($command));
            break;
        default:
            $logFile = shell_exec($command);
            break;
    }

    if ($logFile) {
        print "<pre>";
        print file_get_contents("{$logFile}");
        print "</pre>";
    } else {
        print "<h2>File not found</h2>";
    }
}

catch (Exception $e)
{
	print json_encode(
		array(
			"returnCode" => 1,
			"errorCode"  => $e->getCode(),
			"errorText"  => $e->getMessage(),
			"errorFile"  => $e->getFile(),
			"errorLine"  => $e->getLine(),
			"errorStack" => $e->getTraceAsString()
			)
		);
}
