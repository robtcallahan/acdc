<?php
/*******************************************************************************
 *
 * $Id: assets_search.php 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/assets_search.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\HPSIM\HPSIMBladeTable;
use STS\HPSIM\HPSIMChassisTable;

try 
{
	$config = $GLOBALS['config'];

	$query = $_POST['query'];

	$assetTable = new AssetTable();

	$bladeTable = new HPSIMBladeTable();
	$chassisTable = new HPSIMChassisTable();

	$assets = array();

    // search by name
	$results = $assetTable->getByLabelLike($query);
    foreach ($results as $a) {
        if (preg_match("/Sterling/", $a->getLocation())) {
            $locId = 1;
        } else if (preg_match("/Charlotte/", $a->getLocation())) {
            $locId = 2;
        } else {
            continue;
        }
		$assets[] = array(
			"id"    => $a->getId(),
			"cabinetId" => $a->getCabinetId(),
            "elevation" => $a->getElevation(),
            "locationId" => $locId,
			"label"  => $a->getLabel(),
			"match" => 'name',
			"isBlade" => 0,
			"displayValue" => $a->getLabel()
		);
	}

    // search by CI serial number
	$results = $assetTable->getBySerialNumberLike($query);
    foreach ($results as $a) {
        if (preg_match("/Sterling/", $a->getLocation())) {
            $locId = 1;
        } else if (preg_match("/Charlotte/", $a->getLocation())) {
            $locId = 2;
        } else {
            continue;
        }
        $assets[] = array(
			"id"    => $a->getId(),
			"cabinetId" => $a->getCabinetId(),
            "elevation" => $a->getElevation(),
            "locationId" => $locId,
            "label"  => $a->getLabel(),
			"match" => 'serialNumber',
			"isBlade" => 0,
			"displayValue" => $a->getSerialNumber()
		);
	}

	// search blade names
	$blades = $bladeTable->getByDeviceNameLike($query);
	for ($i=0; $i<count($blades); $i++) {
		$blade = $blades[$i];
		$chassis = $chassisTable->getById($blade->getChassisId());
		$asset = $assetTable->getBySysId($chassis->getSysId());

		if ($asset->getId()) {
            if (preg_match("/Sterling/", $asset->getLocation())) {
                $locId = 1;
            } else if (preg_match("/Charlotte/", $asset->getLocation())) {
                $locId = 2;
            } else {
                continue;
            }
            $assets[] = array(
				"id"    => $blade->getId(),
				"cabinetId" => $asset->getCabinetId(),
                "elevation" => $asset->getElevation(),
                "locationId" => $locId,
                "label"  => $blade->getDeviceName(),
				"match" => 'name',
				"isBlade" => 1,
				"displayValue" => $blade->getDeviceName()
			);
		}
	}

	echo json_encode(
		array(
			"returnCode" => 0,
			"total"      => count($assets),
			"assets"     => $assets
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
