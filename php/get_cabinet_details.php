<?php
/*******************************************************************************
 *
 * $Id: get_cabinet_details.php 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_cabinet_details.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\HPSIM\HPSIM;
use STS\HPSIM\HPSIMBladeTable;
use STS\HPSIM\HPSIMChassisTable;

try
{
	$config = $GLOBALS['config'];
    $snSite = $config->servicenow->site;
   	$snConfig = $config->servicenow->$snSite;

    $cabinetId = null;
    if (array_key_exists('cabinetId', $_POST)) {
        $cabinetId = $_POST['cabinetId'];
    } else if (array_key_exists('cabinetId', $_GET)) {
        $cabinetId = $_GET['cabinetId'];
    } else {
        throw new ErrorException("Cabinet ID not passed. Cannot provide cabinet details");
    }
    $cabinetTable = new CabinetTable();

    if (strlen($cabinetId) == 32) {
        $cabinet = $cabinetTable->getBySysId($cabinetId);
    } else {
        $cabinet = $cabinetTable->getById($cabinetId);
    }

    $cabinetTypeTable = new CabinetTypeTable();
    $cabinetType = $cabinetTypeTable->getById($cabinet->getCabinetTypeId());

    // retrieve the RUs for this cabinet and make a hash by RU
    $ruTable = new RUTable();
    $rus = $ruTable->getAllByCabinetId($cabinetId);
    $ruHash = array();
    foreach ($rus as $ru) {
        $ruHash[$ru->getRuNumber()] = $ru->toObject();
    }

    // retrieve RU reservations for this cabinet
    $ruReservationsTable = new RUReservationTable();
    $ruReservations = $ruReservationsTable->getAllByCabinetId($cabinetId);
    $ruResHash = array();
    foreach ($ruReservations as $res) {
        if ($res->getRUNumbers()) {
            $rus = explode(",", $res->getRuNumbers());
            foreach($rus as $ru) {
                $ruResHash[$ru] = $res->toObject();
            }
        }
    }

	$acdc = new ACDC();
	$assets = $acdc->getCabinetAssets($cabinet->getId());
    $exceptions = $acdc->cabinetHasExceptions($cabinet->getId());

	$hpsim = new HPSIM();
	$chassisTable = new HPSIMChassisTable();
	$bladeTable = new HPSIMBladeTable();

	for ($i=0; $i<count($assets); $i++) {
		$a = $assets[$i];
		$a->fqdn = $a->name;
		if (preg_match("/^([\w\d-]+)\./", $a->fqdn, $m)) {
			$a->name = $m[1];
		}
		$chassis = $chassisTable->getByFullDnsName($a->fqdn);
		$bladeArray = array();
		if ($chassis->getId()) {
			$blades = $hpsim->getChassisBladesByChassisId($chassis->getId());
		} else {
			$blades = array();
		}
		$assets[$i]->blades = $blades;
        $assets[$i]->elevation = intval($assets[$i]->elevation);
        $assets[$i]->numRUs = intval($assets[$i]->numRUs);

        if ($a->sysId != null) {
            $cmdbUrl  = "https://" . $snConfig->server . "/nav_to.do?uri=" . $a->sysClassName . ".do?sys_id=" . $a->sysId;
            $assets[$i]->cmdbLink = "<span title='Click to go to the CMDB entry' class='text-link' onclick=window.open('" . $cmdbUrl . "','_blank');>" . $a->name . "</span>";
        } else {
            $assets[$i]->cmdbLink = "<span class='red-alert'>NOT FOUND IN CMDB</span>";
        }

	}
    header('Content-Type: application/json');
	echo json_encode(
		array(
			"returnCode"  => 0,
            "cabinetId"   => $cabinetId,
            "exceptions"  => $exceptions,
            "cabinetType" => $cabinetType->toObject(),
			"assets"      => $assets,
            "ruHash"      => $ruHash,
            "ruResHash"   => $ruResHash
			)
		);
}                                                    

catch (Exception $e)
{
    header('Content-Type: application/json');
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
