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

use STS\CMDB\CMDBLocationTable;
use STS\CMDB\CMDBRackTable;
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
    $query    = $_POST['query'];

    $locationName = array_key_exists('locationName', $_POST) ? $_POST['locationName'] : "";


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
                //if (!preg_match("/(Sterling|Charlotte)/", $location->getName()) || preg_match("/(PDU|STS)/", $location->getName())) continue;
                if (preg_match("/(PDU|STS)/", $location->getName())) continue;
                $items[] = array(
                    "id"   => $location->getName(),
                    "name" => $location->getName()
                );
            }
            break;

        case 'cabinet':
            if ($locationName == "") {
                throw new ErrorException("Location name not passed. Cannot look up racks");
            }
            //$locationTable = new CMDBLocationTable();
            //$location      = $locationTable->getByName($locationName);
            //$rackTable     = new CMDBRackTable();
            //$racks         = $rackTable->getByLocationId($location->getSysId(), $query);
            $locationTable = new LocationTable();
            $location = $locationTable->getByName($locationName);
            $rackTable = new CabinetTable();
            if ($query) {
                $racks = $rackTable->getByNameLikeAndLocationId($query, $location->getId());
            } else {
                $racks = $rackTable->getAllByLocationId($location->getId());
            }
            foreach ($racks as $rack) {
                $items[] = array(
                    "id"   => $rack->getId(),
                    "name" => $rack->getName()
                );
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
