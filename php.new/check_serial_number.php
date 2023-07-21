<?php
/*******************************************************************************
 *
 * $Id: check_serial_number.php 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/check_serial_number.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try 
{
    $config = $GLOBALS['config'];

	$serialNumber = $_POST['serialNumber'];

	$assetTable = new AssetTable();
    $asset = $assetTable->getBySerialNumber($serialNumber);
    if ($asset->getId()) {
        $found = 1;
        $label = $asset->getLabel();
    } else {
        $found = 0;
        $label = "";
    }

	echo json_encode(
		array(
			"returnCode" => 0,
			"found" => $found,
            "label" => $label
			)
		);
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
