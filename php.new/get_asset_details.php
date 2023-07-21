<?php
/*******************************************************************************
 *
 * $Id: get_asset_details.php 82525 2014-01-07 20:44:41Z rcallaha $
 * $Date: 2014-01-07 15:44:41 -0500 (Tue, 07 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82525 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_asset_details.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\HPSIM\HPSIMBladeTable;
use STS\HPSIM\HPSIMChassisTable;

use STS\CMDB\CMDBCI;
use STS\CMDB\CMDBCITable;
use STS\CMDB\CMDBServer;
use STS\CMDB\CMDBServerTable;
use STS\CMDB\CMDBStorageDeviceTable;
use STS\CMDB\CMDBSANSwitchTable;
use STS\CMDB\CMDBNetworkDeviceTable;

use STS\CMDB\CMDBSubsystem;
use STS\CMDB\CMDBSubsystemTable;

use STS\Util\HTTPParameters;

try {
    // config info
    $config   = $GLOBALS['config'];
    $snSite   = $config->servicenow->site;
    $snConfig = $config->servicenow->$snSite;

    // POST params
    $httpParams = new HTTPParameters();
    $params     = $httpParams->getParams(array('cmdbSysId', 'assetId', 'isBlade'));

    // instantiate needed classes
    $assetTable    = new AssetTable();
    $cabinetTable  = new CabinetTable();
    $locationTable = new LocationTable();

    $assetStateTable = new AssetStateTable();
    $assetStateHash = $assetStateTable->getHashById();

    $bladeTable   = new HPSIMBladeTable();
    $chassisTable = new HPSIMChassisTable();

    $cmdbSubsystemTable = new CMDBSubsystemTable();

    // if a blade has been selected, get its info
    if ($params['isBlade']) {
        $blade = $bladeTable->getById($params['assetId']);
        if ($blade->getId() == "") returnEmpty();

        $chassis      = $chassisTable->getById($blade->getChassisId());
        $chassisAsset = $assetTable->getByName($chassis->getFullDnsName());
        if ($chassisAsset->getId() == "") returnEmpty();

        $cabinet  = $cabinetTable->getById($chassisAsset->getCabinetId());
        $location = $locationTable->getById($cabinet->getLocationId());

        $cmdbServerTable = new CMDBServerTable();
        $cmdbServer      = $cmdbServerTable->getBySysId($blade->getSysId());
        if ($cmdbServer->getSysId() != "") {
            $subsystem = $cmdbSubsystemTable->getBySysId($cmdbServer->getSubsystemListId());
        } else {
            $cmdbServer = new \STS\CMDB\CMDBServer();
            $subsystem  = new \STS\CMDB\CMDBSubsystem();
        }

        $cmdbUrl  = "https://" . $snConfig->server . "/nav_to.do?uri=cmdb_ci_server.do?sys_id=" . $blade->getSysId();
        $cmdbLink = "<span title='Click to go to the CMDB entry' style='text-decoration: underline;cursor:pointer;' onclick=window.open('" . $cmdbUrl . "','_blank');>" . $blade->getFullDnsName() . "</span>";

        $data = array(
            "sysId"             => $cmdbServer->getSysId(),
            "assetId"           => $blade->getId(),
            "isBlade"           => 1,

            "name"              => $blade->getFullDnsName(),
            "label"             => 'N/A',
            "sysClassName"      => "cmdb_ci_server",
            "assetClass"        => "Host",
            "deviceType"        => $cmdbServer->getHostType(),

            "location"          => $location->getName(),
            "cabinet"           => $cabinet->getName(),
            "elevation"         => $chassisAsset->getElevation(),
            "numRUs"            => $chassisAsset->getNumRUs(),

            "serialNumber"      => $blade->getSerialNumber(),
            "assetTag"          => $cmdbServer->getAssetTag(),
            "manufacturer"      => "HP",
            "model"             => $blade->getProductName(),
            "installStatus"     => $cmdbServer->getInstallStatus(),

            "cmdbLink"          => $cmdbServer->getSysId() != "" ? $cmdbLink : "",
            "environment"       => $cmdbServer->getEnvironment(),
            "businessService"   => $subsystem->getBusinessService(),
            "subsystem"         => $subsystem->getName(),
            "owningSuppMgr"     => $subsystem->getOwningSupportManager(),
            "opsSuppGroup"      => $subsystem->getOperationsSupportGroup(),
            "sysAdminMgr"       => $subsystem->getSystemsAdminManager(),
            "sysAdminGroup"     => $subsystem->getSystemsAdminGroup(),
            "ipAddress"         => $cmdbServer->getIpAddress(),
            "memGB"             => $cmdbServer->getRam(),
            "cpuManufacturer"   => $cmdbServer->getCpuManufacturer(),
            "cpuDescr"          => $cmdbServer->getCpuType(),
            "cpuSpeed"          => $cmdbServer->getCpuSpeed(),
            "cpuCount"          => $cmdbServer->getCpuCount(),
            "cpuCoreCount"      => $cmdbServer->getCpuCoreCount(),
            "os"                => $cmdbServer->getOs(),
            "osVersion"         => $cmdbServer->getOsVersion(),
            "osPatchLevel"      => $cmdbServer->getOsServicePack(),
        );
    } // else if we were passed an CMDB sys_id, as in the case of an install, use this to look up to see if there's
    // and entry in the CMDB
    // else, we assume that assetId was passed, use this to look up the asset as when an asset was clicked in the cabinet
    else {
        $asset   = $assetTable->getById($params['assetId']);
        if ($asset->getId() == "") returnEmpty();

        $cmdbCiTable = new CMDBCITable();
        if ($asset->getSysId()) {
            $ci = $cmdbCiTable->getBySysId($asset->getSysId());
        } else {
            $ci = lookupAssetInCmdb($asset);
            if ($ci->getSysId() == null) {
                $ci->setSysClassName('unknown');
            }
        }

        if ($asset->getCabinetId()) {
            $cabinet  = $cabinetTable->getById($asset->getCabinetId());
            $location = $locationTable->getById($cabinet->getLocationId());
        } else {
            $cabinet = new Cabinet();
            $location = new Location();
        }

        // use the CMDB sys_class_name to retrieve the CI from the appropriate table
        switch ($ci->getSysClassName()) {
            case "cmdb_ci_server":
                $cmdbServerTable = new CMDBServerTable();
                $cmdbCI          = $cmdbServerTable->getById($ci->getSysId());
                break;
            case "cmdb_ci_msd":
                $cmdbStorageTable = new CMDBStorageDeviceTable();
                $cmdbCI           = $cmdbStorageTable->getById($ci->getSysId());
                break;
            case "u_san_switches_storage":
                $cmdbSANSwitchTable = new CMDBSANSwitchTable();
                $cmdbCI             = $cmdbSANSwitchTable->getById($ci->getSysId());
                break;
            case "cmdb_ci_netgear":
                $cmdbNetworkDeviceTable = new CMDBNetworkDeviceTable();
                $cmdbCI                 = $cmdbNetworkDeviceTable->getById($ci->getSysId());
                break;
            default:
                $cmdbCI = new CMDBServer();
                // using set() command here since locationType property doesn't exist on CMDBCI, but we need
                // to have this defined if the class is unknown
        }


        if ($cmdbCI->getSysId() != "") {
            $idsArray = explode(",", $cmdbCI->getSubsystemListId());
            $subsystemId = $idsArray[0];
            $namesArray = explode(",", $cmdbCI->getSubsystemList());
            $subsystemName = $namesArray[0];

            $subsystem = $cmdbSubsystemTable->getBySysId($subsystemId);
            $cmdbUrl   = "https://" . $snConfig->server . "/nav_to.do?uri=" . $ci->getSysClassName() . ".do?sys_id=" . $ci->getSysId();
            $cmdbLink  = "<span title='Click to go to the CMDB entry' style='text-decoration: underline;cursor:pointer;' onclick=window.open('" . $cmdbUrl . "','_blank');>" . $ci->getName() . "</span>";
        } else {
            $subsystem = new CMDBSubsystem();
            $subsystemName = "";
            $cmdbLink  = "<span style='color:red;'>NOT FOUND IN CMDB</span>";
        }

        $data = array(
            "sysId"             => $asset->getSysId(),
            "assetId"           => $asset->getId(),
            "isBlade"           => 0,

            "name"              => $asset->getName(),
            "label"             => $asset->getLabel(),
            "sysClassName"      => $asset->getSysClassName() ? $asset->getSysClassName() : 'cmdb_ci_server',
            "assetClass"        => $asset->getAssetClass() ? $asset->getAssetClass() : 'Host',
            "deviceType"        => $asset->getDeviceType() ? $asset->getDeviceType() : 'Standalone Host',

            "location"          => $location->getName() != null ? $location->getName() : "",
            "cabinet"           => $cabinet->getName() != null ? $cabinet->getName() : "",
            "elevation"         => $asset->getElevation() != null ? $asset->getElevation() : "",
            "numRUs"            => $asset->getNumRUs(),

            "serialNumber"      => $asset->getSerialNumber(),
            "assetTag"          => $asset->getAssetTag(),
            "manufacturer"      => $asset->getManufacturer(),
            "model"             => $asset->getModel(),
            "state"            => $asset->getState(),
            "powerStatus"       => $asset->getPowerStatus(),

            "cmdbLink"          => $cmdbLink,
            "installStatus"     => $asset->getInstallStatus(),
            "environment"       => $cmdbCI->getEnvironment(),
            "businessService"   => $subsystem->getBusinessService(),
            "subsystem"         => $subsystemName,
            "owningSuppMgr"     => $subsystem->getOwningSupportManager(),
            "opsSuppGroup"      => $subsystem->getOperationsSupportGroup(),
            "sysAdminMgr"       => $subsystem->getSystemsAdminManager(),
            "sysAdminGroup"     => $subsystem->getSystemsAdminGroup(),
        );

        if ($ci->getSysClassName() == "cmdb_ci_server") {
            $serverData = array(
                "ipAddress"       => $cmdbCI->getIpAddress(),
                "memGB"           => $cmdbCI->getRam(),
                "cpuManufacturer" => $cmdbCI->getCpuManufacturer(),
                "cpuDescr"        => $cmdbCI->getCpuType(),
                "cpuSpeed"        => $cmdbCI->getCpuSpeed(),
                "cpuCount"        => $cmdbCI->getCpuCount(),
                "cpuCoreCount"    => $cmdbCI->getCpuCoreCount(),
                "os"              => $cmdbCI->getOs(),
                "osVersion"       => $cmdbCI->getOsVersion(),
                "osPatchLevel"    => $cmdbCI->getOsServicePack(),
            );
            $data       = array_merge($data, $serverData);
        }
    }


    echo json_encode(
        array(
            "returnCode" => 0,
            "data"       => $data
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

function returnEmpty()
{
    echo json_encode(
        array(
            "returnCode" => 0,
            "data"       => array()
        )
    );
}

function lookupAssetInCmdb(Asset &$asset)
{
    global $cmdbCiTable;

    $baseQuery = "^sys_class_name=cmdb_ci_server^ORsys_class_name=cmdb_ci_msd^ORsys_class_name=u_san_switches_storage^ORsys_class_name=cmdb_ci_netgear";


    // Search by Name and Serial Number
    $query   = "nameSTARTSWITH" . $asset->getLabel() . "." . "^serial_number=" . $asset->getSerialNumber() . $baseQuery;
    $results = array();
    if ($asset->getSerialNumber()) {
        $results = $cmdbCiTable->getByQueryString($query);
    }

    if (count($results) > 1) {
        return new CMDBCI();
    } else if (count($results) == 1) {
        $ci = $results[0];
        $asset->setFoundBy("HN and SN");
        return $ci;
    } else {
        // search by serial number
        $query   = "serial_number=" . $asset->getSerialNumber() . $baseQuery;
        $results = array();
        if ($asset->getSerialNumber()) {
            $results = $cmdbCiTable->getByQueryString($query);
        }
        if (count($results) > 1) {
            return new CMDBCI();
        } else if (count($results) == 1) {
            $ci = $results[0];
            $asset->setFoundBy("SN");
            return $ci;
        } else {
            // search by host name
            $query   = "nameSTARTSWITH" . $asset->getLabel() . "." . $baseQuery;
            $results = $cmdbCiTable->getByQueryString($query);
            if (count($results) > 1) {
                return new CMDBCI();
            } else if (count($results) == 0) {
                $query   = "name=" . $asset->getLabel() . $baseQuery;
                $results = $cmdbCiTable->getByQueryString($query);
            }

            if (count($results) > 1) {
                return new CMDBCI();
            } else if (count($results) == 1) {
                $ci = $results[0];

                if (preg_match("/[a-z]/", $ci->getSerialNumber())) {
                    // convert to upper case if necessary
                    $ci->setSerialNumber(strtoupper($ci->getSerialNumber()));
                    $ci = updateSerialNumber($cmdbCiTable, $ci);
                } else if (preg_match("/^\s+/", $ci->getSerialNumber()) || preg_match("/\s+$/", $ci->getSerialNumber())) {
                    // remove leading spaces if necessary
                    $ci->setSerialNumber(trim($ci->getSerialNumber()));
                    $ci = updateSerialNumber($cmdbCiTable, $ci);
                }

                if ($ci->getSerialNumber() == "" && $asset->getSerialNumber()) {
                    $ci->setSerialNumber($asset->getSerialNumber());
                    $ci = $cmdbCiTable->update($ci);
                } else if (($ci->getSerialNumber() && !$asset->getSerialNumber()) || (preg_replace("/-/", "", $ci->getSerialNumber()) == $asset->getSerialNumber())) {
                    $asset->setSerialNumber(strtoupper($ci->getSerialNumber()));
                } else if ($ci->getSerialNumber() != $asset->getSerialNumber()) {
                    return new CMDBCI();
                } else {
                    // both CMDB and ACDC SNs are blank. copy the CMDB name to ACDC name
                    $asset->setName($ci->getName());
                }
                $asset->setFoundBy("HN");
                return $ci;
            } else {
                return new CMDBCI();
            }
        }
    }
}

function updateSerialNumber(CMDBCITable $ciTable, CMDBCI $a)
{
    $sn = $a->getSerialNumber();

    $a->setSerialNumber("xxxACDCxxx");
    $a = $ciTable->update($a);

    $a->setSerialNumber(strtoupper($sn));
    $a = $ciTable->update($a);
    return $a;
}
