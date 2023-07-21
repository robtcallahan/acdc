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

    // search by label
	$results = $assetTable->getInstalledByLabelLike($query);
    foreach ($results as $a) {
		$assets[] = array(
			"id"    => $a->getId(),
			"cabinetId" => $a->getCabinetId(),
            "elevation" => $a->getElevation(),
            "numRUs" => $a->getNumRUs(),
            "locationId" => $a->getLocationId(),
			"label"  => $a->getLabel(),
            "state" => $a->getState(),
            "stateId" => $a->getStateId(),
            "match" => 'label',
			"isBlade" => 0,
			"displayValue" => $a->getLabel()
		);
	}

    // search by name
	$results = $assetTable->getInstalledByNameLike($query);
    foreach ($results as $a) {
		$assets[] = array(
			"id"    => $a->getId(),
			"cabinetId" => $a->getCabinetId(),
            "elevation" => $a->getElevation(),
            "numRUs" => $a->getNumRUs(),
            "locationId" => $a->getLocationId(),
			"label"  => $a->getLabel(),
            "state" => $a->getState(),
            "stateId" => $a->getStateId(),
            "match" => 'name',
			"isBlade" => 0,
			"displayValue" => $a->getName()
		);
	}

    // search by CI serial number
	$results = $assetTable->getInstalledBySerialNumberLike($query);
    foreach ($results as $a) {
        $assets[] = array(
			"id"    => $a->getId(),
			"cabinetId" => $a->getCabinetId(),
            "elevation" => $a->getElevation(),
            "numRUs" => $a->getNumRUs(),
            "locationId" => $a->getLocationId(),
            "label"  => $a->getLabel(),
            "state" => $a->getState(),
            "stateId" => $a->getStateId(),
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
            $assets[] = array(
				"id"    => $blade->getId(),
				"cabinetId" => $asset->getCabinetId(),
                "elevation" => $asset->getElevation(),
                "numRUs" => $a->getNumRUs(),
                "locationId" => $asset->getLocationId(),
                "label"  => $blade->getDeviceName(),
                "state" => $a->getState(),
                "stateId" => $a->getStateId(),
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
