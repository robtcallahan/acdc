<?php
/*******************************************************************************
 *
 * $Id: get_asset_exceptions.php 81550 2013-12-02 03:37:06Z rcallaha $
 * $Date: 2013-12-01 22:37:06 -0500 (Sun, 01 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81550 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_asset_exceptions.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try
{
    // config info
	$config = $GLOBALS['config'];

    // get the exception type
    $paramExceptionType = array_key_exists('exceptionType', $_POST) ? $_POST['exceptionType'] : 'asset-not-found';

    // instantiate needed classes
	$assetTable = new AssetTable();
    $exceptionsTable = new AssetExceptionTable();

    $data = array();

    if (preg_match("/asset-not-found|serial-num-mismatch|multiple-ci-matches/", $paramExceptionType)) {
        $exceptions = $exceptionsTable->getAllHashByAssetId();
        foreach ($exceptions as $e) {
            $exceptionType = AssetExceptionTable::$exceptionDescriptions[$e->getExceptionType()];
            $exceptionString = preg_replace("/\s/", "-", strtolower($exceptionType));

            if ($exceptionString != $paramExceptionType) continue;

            $a = $assetTable->getById($e->getAssetId());

            $data[] = array(
                "id"  => $a->getId(),
                "category" => "cmdb",
                "exception" => $exceptionType,
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
                "state" => $a->getState()
            );
        }
    }


    if (preg_match("/missing-elevation|missing-rus/", $paramExceptionType)) {
        if ($paramExceptionType == 'missing-elevation') {
            $assets = $assetTable->getWhere("elevation = 0 or elevation is null or elevation = ''");
            $exceptionType = 'Missing Elevation';
        } else {
            $assets = $assetTable->getWhere("numRUs = 0 or numRUs is null or numRUs = ''");
            $exceptionType = 'Missing RUs';
        }

        foreach ($assets as $a) {
            $data[] = array(
                "id"  => $a->getId(),
                "category" => "cmdb",
                "exception" => $exceptionType,
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
                "state" => $a->getState()
            );
        }
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
