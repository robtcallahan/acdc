<?php
/*******************************************************************************
 *
 * $Id: get_asset_combo_items.php 81202 2013-11-14 14:25:50Z rcallaha $
 * $Date: 2013-11-14 09:25:50 -0500 (Thu, 14 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81202 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_asset_combo_items.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBCITable;
use STS\CMDB\CMDBListTable;
use STS\CMDB\CMDBManufacturerTable;

use STS\Util\SysLog;

try {
    $config = $GLOBALS['config'];

    // Set up SysLog
    $sysLog   = SysLog::singleton($config->appName);
    $logLevel = $config->logLevel;

    $itemName = $_POST['itemName'];
    $query    = array_key_exists('query', $_POST) ? $_POST['query'] : null;



    $items = array();

    switch ($itemName) {
        case 'deviceType':
            $cmdbDeviceTypes = getDeviceType($_POST['sysClassName']);

            foreach ($cmdbDeviceTypes as $i => $value) {
                $items[] = array(
                    "id"   => $i,
                    "name" => $value
                );
            }
            break;

        case 'manufacturer':
            $cmdbManTable = new CMDBManufacturerTable();
            $cmdbMans     = $cmdbManTable->getAll($query);
            foreach ($cmdbMans as $cmdbMan) {
                $items[] = array(
                    "id"   => $cmdbMan->getSysId(),
                    "name" => $cmdbMan->getName()
                );
            }
            break;

        case 'location':
            //$locationTable = new CMDBLocationTable();
            //$locations     = $locationTable->getAll($query);
            $locationTable = new LocationTable();
            $locations = $locationTable->getAll();
            foreach ($locations as $location ) {
                $items[] = array(
                    "id"   => $location->getId(),
                    "name" => $location->getName()
                );
            }
            break;

        case 'businessService':
            // get the ACDC known locations
            $bsTable = new STS\SNCache\BusinessServiceTable();
            $bServices = $bsTable->getAll($query);

        	$data = array();
            foreach ($bServices as $bs) {
                $items[] = array(
                    "id" => $bs->getSysId(),
                    "name" => $bs->getName()
                );
            }
            break;

        case 'cabinet':
            if (!array_key_exists('locationName', $_POST) || !$_POST['locationName']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Location name not passed. Cannot look up list of cabinets. Please enter a location."
                    )
                );
                exit;
            }
            $locationTable = new LocationTable();
            $location = $locationTable->getByName($_POST['locationName']);
            $rackTable = new CabinetTable();
            if ($query) {
                $racks = $rackTable->getByNameLikeAndLocationId($query, $location->getId());
            } else {
                $racks = $rackTable->getAllByLocationId($location->getId());
            }
            foreach ($racks as $rack) {
                $items[] = array(
                    "id"   => $rack->getName(),
                    "name" => $rack->getName()
                );
            }
            break;

        case 'elevation':
            if (!array_key_exists('locationName', $_POST) || !$_POST['locationName']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Location name not passed. Cannot look up list of elevations. Please enter a location."
                    )
                );
                exit;
            }
            if (!array_key_exists('cabinetName', $_POST) || !$_POST['cabinetName']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Cabinet name not passed. Cannot look up list of elevations. Please enter a cabinet name."
                    )
                );
                exit;
            }

            $locationTable = new LocationTable();
            $location = $locationTable->getByName($_POST['locationName']);

            $rackTable = new CabinetTable();
            $cabinet = $rackTable->getByNameAndLocationId($_POST['cabinetName'], $location->getId());

            // cabinet may not exist if asset is in the CMDB but never added to ACDC
            if (!$cabinet->getId()) {
                $cmdbRackTable = new \STS\CMDB\CMDBRackTable();
                $cmdbRack = $cmdbRackTable->getByNameAndLocationId($_POST['cabinetName'], $location->getId());

                // create the cabinet
                $cabinet = new Cabinet();
                $cabinet->setLocationId($location->getId())
                        ->setName($_POST['cabinetName'])
                        ->setCabinetTypeId(1) // using standard 24"x36", 44 RUs
                        ->setSysId($cmdbRack->getSysId() ? $cmdbRack->getSysId() : null)
                        ->setHasPower(1)
                        ->setX(100)
                        ->setY(100)
                        ->setRotation(0);
                $cabinetTable = new CabinetTable();
                $cabinet = $cabinetTable->create($cabinet);
            }

            $cabinetTypeTable = new CabinetTypeTable();
            $cabinetType = $cabinetTypeTable->getById($cabinet->getCabinetTypeId());

            // get cabinet assets
            $assetTable = new AssetTable();
            $assets = $assetTable->getInstalledByCabinetId($cabinet->getId());
            $used = array();
            foreach ($assets as $asset) {
                for ($i=0; $i<$asset->getNumRUs(); $i++) {
                    $used[$asset->getElevation() - $i] = 1;
                }
            }

            // get cabinet RUs so we know which RUs are unusable
            $ruTable = new RUTable();
            $rus = $ruTable->getAllByCabinetId($cabinet->getId());
            $ruHash = array();
            foreach ($rus as $ru) {
                $ruHash[$ru->getRuNumber()] = $ru->toObject();
            }

            // retrieve RU reservations for this cabinet
            $ruReservationsTable = new RUReservationTable();
            $ruReservations = $ruReservationsTable->getAllByCabinetId($cabinet->getId());
            $ruResHash = array();
            foreach ($ruReservations as $res) {
                for ($i=0; $i<$res->getNumRUs(); $i++) {
                    $ruResHash[$res->getElevation() - $i] = $res;
                }
            }

            // now loop over all RUs for this cabinet and build a list of available
            // RUs skipping assets and unusable RUs
            $items = array();
            // start at top and descend
            for ($i=$cabinetType->getElevation(); $i>0; $i--) {
                /** @var $ruResHash RUReservation[] */
                if (array_key_exists($i, $ruResHash)) {
                    $items[] = array(
                        "id" => $i,
                        "name" => $i . " (Res: " . $ruResHash[$i]->getNumRUs() . " RUs)",
                        "reserved" => 1,
                        "numRUs" => $ruResHash[$i]->getNumRUs()
                    );
                    $i = $i - $ruResHash[$i]->getNumRUs() + 1;
                }
                else if (!array_key_exists($i, $used)
                    && !array_key_exists($i, $ruHash)
                    || (array_key_exists($i, $ruHash) && $ruHash[$i]->usable)) {
                    $items[] = array(
                        "id" => $i,
                        "name" => $i,
                        "reserved" => 0,
                        "numRUs" => 1
                    );
                }
            }

            break;

        case 'numrus':
            if (!array_key_exists('locationName', $_POST) || !$_POST['locationName']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Location name not passed. Cannot look up number of RUs. Please enter a location."
                    )
                );
                exit;
            }
            if (!array_key_exists('cabinetName', $_POST) || !$_POST['cabinetName']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Cabinet name not passed. Cannot look up number of RUs. Please enter a cabinet name."
                    )
                );
                exit;
            }
            if (!array_key_exists('elevation', $_POST) || !$_POST['elevation']) {
                echo json_encode(
                    array(
                        "returnCode" => 1,
                        "userMessage"  => "Elevation not passed. Cannot look up number of RUs. Please enter an elevation."
                    )
                );
                exit;
            }

            $locationTable = new LocationTable();
            $location = $locationTable->getByName($_POST['locationName']);

            $rackTable = new CabinetTable();
            $cabinet = $rackTable->getByNameAndLocationId($_POST['cabinetName'], $location->getId());

            // cabinet may not exist if asset is in the CMDB but never added to ACDC
            if (!$cabinet->getId()) {
                $cmdbRackTable = new \STS\CMDB\CMDBRackTable();
                $cmdbRack = $cmdbRackTable->getByNameAndLocationId($_POST['cabinetName'], $location->getId());

                // create the cabinet
                $cabinet = new Cabinet();
                $cabinet->setLocationId($location->getId())
                        ->setName($_POST['cabinetName'])
                        ->setCabinetTypeId(1) // using standard 24"x36", 44 RUs
                        ->setSysId($cmdbRack->getSysId() ? $cmdbRack->getSysId() : null)
                        ->setHasPower(1)
                        ->setX(100)
                        ->setY(100)
                        ->setRotation(0);
                $cabinetTable = new CabinetTable();
                $cabinet = $cabinetTable->create($cabinet);
            }

            $cabinetTypeTable = new CabinetTypeTable();
            $cabinetType = $cabinetTypeTable->getById($cabinet->getCabinetTypeId());

            // get cabinet assets
            $assetTable = new AssetTable();
            $assets = $assetTable->getInstalledByCabinetId($cabinet->getId());
            $used = array();
            foreach ($assets as $asset) {
                for ($i=0; $i<$asset->getNumRUs(); $i++) {
                    $used[$asset->getElevation() - $i] = 1;
                }
            }

            // get cabinet RUs so we know which RUs are unusable
            $ruTable = new RUTable();
            $rus = $ruTable->getAllByCabinetId($cabinet->getId());
            $ruHash = array();
            foreach ($rus as $ru) {
                $ruHash[$ru->getRuNumber()] = $ru->toObject();
            }

            // retrieve RU reservations for this cabinet
            $ruReservationsTable = new RUReservationTable();
            $ruReservations = $ruReservationsTable->getAllByCabinetId($cabinet->getId());
            $ruResHash = array();
            foreach ($ruReservations as $res) {
                for ($i=0; $i<$res->getNumRUs(); $i++) {
                    $ruResHash[$res->getElevation() - $i] = $res;
                }
            }

            // now loop over all RUs for this cabinet and build a list of available
            // RUs skipping assets and unusable RUs
            $items = array();
            $numRUs = 0;
            // start at top and descend
            for ($i=$_POST['elevation']; $i>0; $i--) {
                /** @var $ruResHash RUReservation[] */
                if (array_key_exists($i, $ruResHash)) {
                    $items[] = array(
                        "id" => $ruResHash[$i]->getNumRUs(),
                        "name" => $ruResHash[$i]->getNumRUs()
                    );
                    break;
                }
                else if (!array_key_exists($i, $used)
                    && !array_key_exists($i, $ruHash)
                    || (array_key_exists($i, $ruHash) && $ruHash[$i]->usable)) {
                    $numRUs++;
                    $items[] = array(
                        "id" => $numRUs,
                        "name" => $numRUs
                    );
                } else {
                    break;
                }
            }

            break;

        case 'name':
            $cmdbCITable = new CMDBCITable();
            $cis         = $cmdbCITable->getAllByNameLike($query);
            foreach ($cis as $ci) {
                if (!preg_match("/cmdb_ci_server|cmdb_ci_msd|u_san_switches_storage|cmdb_ci_netgear/", $ci->getSysClassName())) continue;
                $items[] = array(
                    "id"   => $ci->getSysId(),
                    "name" => $ci->getName()
                );
            }
            break;

        case 'state':
            $assetStateTable = new AssetStateTable();
            $results = $assetStateTable->getAll('id');
            foreach ($results as $state) {
                $items[] = array(
                    "id"   => $state->getId(),
                    "name" => $state->getName()
                );
            }
            break;

    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "errorCode"  => 0,
            "errorText"  => "",
            "total"      => count($items),
            "items"      => $items
        )
    );
} catch (Exception $e) {
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

function getDeviceType($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            $cmdbListTable = new CMDBListTable('u_host_type', 'cmdb_ci_server');
            return $cmdbListTable->getArray();
            break;
        case 'cmdb_ci_msd':
            $cmdbListTable = new CMDBListTable('device_type', 'cmdb_ci_msd');
            return $cmdbListTable->getArray();
            break;
        case 'u_san_switches_storage':
            #$cmdbListTable = new CMDBListTable('device_type', 'u_san_switches_storage');
            #return $cmdbListTable->getArray();
            # SAN Switches do not have device types, return empty array
            return array();
            break;
        case 'cmdb_ci_netgear':
            $cmdbListTable = new CMDBListTable('device_type', 'cmdb_ci_netgear');
            return $cmdbListTable->getArray();
            break;
        default:
            throw new ErrorException('Unknown sys_class_name: ' . $sysClassName);
    }
}
