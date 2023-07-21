<?php
/*******************************************************************************
 *
 * $Id: get_cabinet_util.php 82190 2013-12-20 17:05:05Z rcallaha $
 * $Date: 2013-12-20 12:05:05 -0500 (Fri, 20 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 82190 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_cabinet_util.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";
#require_once __DIR__ . '/../lib/FirePHPCore/FirePHP.class.php';

try 
{
    $config = $GLOBALS['config'];

	$locationId = array_key_exists('locationId', $_POST) ? $_POST['locationId'] : 1;

    // necessary instantiations
    #$firephp = FirePHP::getInstance(true);
	$locationTable = new LocationTable();
	$cabinetTable = new CabinetTable();
    $assetTable = new AssetTable();

    // get the locations from the locationId POSTed
    $locations = array();
	$locations[] = $locationTable->getById($locationId);

    // TODO: need a better way of getting cabinets for charlotte (clt-1 and clt-3)
    // need charlotte clt-1 and clt-3
    if ($locationId == 2) {
        $moreLocations[] = $locationTable->getById(3);
        $locations = array_merge($locations, $moreLocations);
    }

    // now get a list of cabinets in this location
	$cabinets = array();
    /** @noinspection PhpUndefinedClassInspection */
    /** @var Location[] $locations */
    foreach ($locations as $location) {
		$results = $cabinetTable->getAllByLocationId($location->getId());
		$cabinets = array_merge($cabinets, $results);
	}

    // loop over all the cabinets looking at the assets contained therein and determine if it's
    // almost empty (or empty) or almost full
    // Almost Empty = number of RUs occupied <= 10
    // Almost Full  = number RUs occupied >= 30
	$util = array();
    /** @var Cabinet[] $cabinets */
    foreach ($cabinets as $cabinet)
	{
        // get a list of assets
        $assets = $assetTable->getInstalledByCabinetId($cabinet->getId());
        $numRUs = 0;
        foreach ($assets as $asset) {
            $numRUs += $asset->getNumRUs();
        }

        // retrieve the RUs for this cabinet add add unusable RUs to the numRUs used
        $ruTable = new RUTable();
        $rus = $ruTable->getAllByCabinetId($cabinet->getId());
        foreach ($rus as $ru) {
            if (!$ru->getUsable()) {
                $numRUs += 1;
            }
        }

        // retrieve RU reservations for this cabinet and add the number of RUs for each and add those to
        // the numRUs used
        $ruReservationsTable = new RUReservationTable();
        $ruReservations = $ruReservationsTable->getAllByCabinetId($cabinet->getId());
        foreach ($ruReservations as $res) {
            if ($res->getRUNumbers()) {
                $numRUs += $res->getRuNumbers();
            }
        }

        $object = array(
            "id" => $cabinet->getId(),
            "name" => $cabinet->getName(),
            "numRUsUsed" => $numRUs,
            "numAssets" => count($assets)
        );

        if ($numRUs == 0) {
            #$firephp->log("EMPTY: " . $cabinet->getName() . "(" . $cabinet->getId() . "): numRUs=" . $numRUs . ", numAssets=" . count($assets));
            $object['utilStatus'] = CABINETUTILEMPTY;
        } else if ($numRUs >= 38 || ($numRUs > 20 && count($assets) > 15)) {
            #$firephp->log("FULL: " . $cabinet->getName() . "(" . $cabinet->getId() . "): numRUs=" . $numRUs . ", numAssets=" . count($assets));
            $object['utilStatus'] = CABINETUTILFULL;
        } else {
            #$firephp->log("OK: " . $cabinet->getName() . "(" . $cabinet->getId() . "): numRUs=" . $numRUs . ", numAssets=" .    count($assets));
            $object['utilStatus'] = CABINETUTILOK;
        }
        $util[] = $object;
	}
	
	echo json_encode(
		array(
			"returnCode" => 0,
			"util"  => $util
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
