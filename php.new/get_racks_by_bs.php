<?php
/*******************************************************************************
 *
 * $Id: assets_search.php 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/assets_search.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try
{
	$config = $GLOBALS['config'];

	$bsSysId = $_POST['bsSysId'];

    $assetTable = new AssetTable();
    $cabinetTable = new CabinetTable();

    // search by BS sysId
    $assets = $assetTable->getInstalledByBusinessServiceId($bsSysId);

    $data = array();
    foreach ($assets as $a) {
        $hash = array(
                "id"  => $a->getCabinetId(),
                "name" => $a->getCabinet()
            );
        $data[] = $hash;
	}

	echo json_encode(
		array(
			"returnCode" => 0,
			"total"      => count($data),
			"cabinets"  => $data
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
