<?php
/*******************************************************************************
 *
 * $Id: get_assets.php 81636 2013-12-03 19:29:11Z rcallaha $
 * $Date: 2013-12-03 14:29:11 -0500 (Tue, 03 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81636 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_assets.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try
{
    // config info
	$config = $GLOBALS['config'];

    // location
    $locationId = array_key_exists('locationId', $_POST) ? $_POST['locationId'] : 1;

    // instantiate needed classes
	$assetTable = new AssetTable();

    if ($locationId) {
        $assets = $assetTable->getAllByLocationId($locationId);
    } else {
        $assets = $assetTable->getAll();
    }

    $data = array();
    $i = 0;
    foreach ($assets as $a) {
        $i++;
        #if ($i > 200) break;
        $data[] = array(
            "id"  => $a->getId(),
            "name" => $a->getName(),
            "label" => $a->getLabel(),
            "location" => $a->getLocation(),
            "cabinet"  => $a->getCabinet(),
            "serialNumber" => $a->getSerialNumber(),
            "assetTag" => $a->getAssetTag(),
            "manufacturer" => $a->getManufacturer(),
            "model" => $a->getModel(),
            "elevation" => $a->getElevation(),
            "numRUs" => $a->getNumRUs(),
            "businessService" => $a->getBusinessService(),
            "subsystem" => $a->getSubsystem(),
            "state" => $a->getState()
        );
    }

	echo json_encode(
		array(
			"returnCode" => 0,
			"assets"     => $data,
            "count"      => count($data)
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
