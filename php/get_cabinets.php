<?php
/*******************************************************************************
 *
 * $Id: get_cabinets.php 81889 2013-12-11 20:43:06Z rcallaha $
 * $Date: 2013-12-11 15:43:06 -0500 (Wed, 11 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81889 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_cabinets.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try 
{
    $config = $GLOBALS['config'];
    $snSite = $config->servicenow->site;
   	$snConfig = $config->servicenow->$snSite;

	$locationId = array_key_exists('locationId', $_POST) ? $_POST['locationId'] : 3;

	$locationTable = new LocationTable();
	$cabinetTable = new CabinetTable();
	$cabinetTypeTable = new CabinetTypeTable();
    $assetTable = new AssetTable();

    $acdc = new ACDC();

	$location = $locationTable->getById($locationId);
    $cabinets = $cabinetTable->getAllByLocationId($locationId);

	$data = array();
    /** @var Cabinet $cabinet */
	foreach ($cabinets as $cabinet)
	{
        // get the cabinet type
		$cabinetType = $cabinetTypeTable->getById($cabinet->getCabinetTypeId());

        // get the number of assets in this cabinet
        $numAssets = $assetTable->getNumAssetsByCabinetId($cabinet->getId());

        // check for assets in the cabinet with exceptions (missing elevation, numRUs, or not in CMDB)
        $exceptions = $acdc->getCabinetExceptions($cabinet->getId());
        $excHtml = "<div class='cab-details-title'>Cabinet " . $cabinet->getName() . " Exceptions</div><table>";
        foreach ($exceptions as $e) {
            $excHtml .= "<tr><td><span class='text-link' onclick=app.assetDetails.showAsset(" . $e->id . ");>" . $e->name . "</span>:</td><td>";
            if ($e->sysId == null) $excHtml .= "[not found in CMDB]";
            if ($e->elevation == 0) $excHtml .= "[elevation is 0]";
            if ($e->numRUs == 0) $excHtml .= "[numRUs is 0]";
            $excHtml .= "</td></tr>";
        }

		$data[] = array(
			"id"           => $cabinet->getId(),
			"ctId"         => $cabinet->getCabinetTypeId(),
            "locationId"   => $cabinet->getLocationId(),
			"name"         => $cabinet->getName(),
			"ctName"       => $cabinetType->getName(),
			"ctType"       => $cabinetType->getType(),
			"ctImageName"  => $cabinetType->getImageName(),
			"ctLength"     => $cabinetType->getLength(),
			"ctWidth"      => $cabinetType->getWidth(),
			"x"            => $cabinet->getX(),
			"y"            => $cabinet->getY(),
            "rotation"     => $cabinet->getRotation(),
            "hasPower"     => $cabinet->getHasPower(),
            "hasExceptions" => count($exceptions) > 0 ? true : false,
            "exceptionsHtml" => $excHtml,
            "numAssets"    => $numAssets
		);
	}
	
	echo json_encode(
		array(
			"returnCode" => 0,
            "location"   => $location->toObject(),
			"cabinets"   => $data
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
