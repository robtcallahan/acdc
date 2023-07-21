<?php
/*******************************************************************************
 *
 * $Id: save_bulk_changes.php 81566 2013-12-02 15:39:06Z rcallaha $
 * $Date: 2013-12-02 10:39:06 -0500 (Mon, 02 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81566 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/save_bulk_changes.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBCITable;
use STS\CMDB\CMDBServerTable;
use STS\CMDB\CMDBStorageDeviceTable;
use STS\CMDB\CMDBSANSwitchTable;
use STS\CMDB\CMDBNetworkDeviceTable;

use STS\CMDB\CMDBLocationTable;

use STS\CMDB\CMDBListTable;

use STS\Login\UserTable;
use STS\Util\SysLog;

try {
    $config = $GLOBALS['config'];

    // Set up SysLog
    $sysLog   = SysLog::singleton($config->appName);
    $logLevel = $config->logLevel;

    // get the actor info
    $userName  = $_SERVER["PHP_AUTH_USER"];
    $userTable = new UserTable();
    $actor     = $userTable->getByUserName($userName);

    $message   = ""; // text to return to UI specifying an issue that occurred

    // POST params
    $stateId = $_POST['stateId'];
    $assetIds = json_decode($_POST['assetIds']);

    // necessary classes
    $assetTable    = new AssetTable();
    $asset         = null;
    $cabinetTable  = new CabinetTable();

    $auditTable    = new AuditTable();
    $actionTable   = new ActionTable();
    $action        = new Action();
    $assetStateTable = new AssetStateTable();

    $cmdbCITable   = new CMDBCITable();
    $cmdbLocationTable = new CMDBLocationTable();
    $cmdbLocationOffSite = $cmdbLocationTable->getByName('Sterling-VA-JK-Moving');

    // get a list of state values to decode the state text that was passed (state is a separate table)
    $assetStateIds = $assetStateTable->getHashById();
    $stateName = $assetStateIds[$stateId];

    foreach ($assetIds as $id) {
        $asset = $assetTable->getById($id);

        if ($stateId != $asset->getState()) {
            // In Transit, Decommed *, Awaiting Disposal or Disposed
            $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), $stateName);

            // if asset is in transit, decommed and not on-tile, awaiting disposal or disposed clear asset cabinet id and elevation
            // clear CMDB CI rack and elevation (below)
            if ($stateName != 'Decommed On-Tile' && $stateName != 'Installed') {
                // clear the cabinet and elevation properties
                $asset->setCabinetId(null)
                    ->setElevation(null);
            }

            $asset->setAssetStateId($stateId);

            // need to create entries in the audit table for every property that has changed
            foreach ($asset->getChanges() as $prop => $chg) {
                // if a property changed that is a foreign key, we need to get its value and add that rather than the id value for readability purposes
                if ($prop == "assetStateId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'state', $assetStateIds[$chg->originalValue], $assetStateIds[$chg->modifiedValue]);
                } else if ($prop == "cabinetId") {
                    // the only value this will change to is null
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'cabinet', $asset->getCabinet(), "");
                } else {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
            }

            // now we can save the asset locally
            $asset = $assetTable->update($asset);

            // Update the CMDB CI
            $cmdbCI = new \STS\CMDB\CMDBCI();

            // Get the CI record from the CMDB
            if ($asset->getSysId()) {
                // here we have the sysId defined in the asset table
                $cmdbCI = $cmdbCITable->getBySysId($asset->getSysId());

                // if the CI was found, get the sub table based upon the sys_class_name
                $cmdbTable = getCmdbTable($asset->getSysClassName());

                // get a list of correct install state values for this calss
                $cmdbStatusHash = getInstallStatusHash($asset->getSysClassName());

                // get the asset
                $cmdbAsset = $cmdbTable->getBySysId($cmdbCI->getSysId());

                // clear the rack and elevation if necessary
                if (!$asset->getCabinetId()) $cmdbAsset->setRackId("");
                if (!$asset->getElevation()) $cmdbAsset->setRackPosition("");

                // set the CMDB CI Install Status. Save the current value so we can update the audit table later
                $installStatus = $asset->getInstallStatus();
                if ($action->getAction() == ActionTable::IN_TRANSIT) {
                    // CMDB CI status = Staging
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Staging']);
                    $asset->setInstallStatus('Staging');
                } else if (preg_match("/Decommed/", $action->getAction())) {
                    // CMDB CI status = Decommissioning
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Decommissioning']);
                    $asset->setInstallStatus('Decommissioning');

                    if ($action->getAction() == $actionTable::DECOMMED_OFFSITE) {
                        $cmdbAsset->setLocationId($cmdbLocationOffSite->getSysId());
                    }
                } else if ($action->getAction() == $actionTable::DISPOSED) {
                    // CMDB CI status = Disposed
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Disposed']);
                    $cmdbAsset->setLocationId(' ');
                    $asset->setInstallStatus('Disposed');
                }

                // Save the CMDB CI
                if ($config->cmdbUpdate) $cmdbAsset = $cmdbTable->update($cmdbAsset);

                // if the CMDB CI Install Status changed, then we updated the asset's install status so we need to save it
                // and add an entry to the audit table as well
                // need to create entries in the audit table for every property that has changed
                foreach ($asset->getChanges() as $prop => $chg) {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
                $asset = $assetTable->update($asset);
            }
        }
    }

    echo json_encode(
        array(
            'returnCode' => 0,
            'message'    => $message != "" ? $message : ""
        )
    );
}

catch (Exception $e) {
    print json_encode(
        array(
            'returnCode' => 1,
            'errorCode'  => $e->getCode(),
            'errorText'  => $e->getMessage(),
            'errorFile'  => $e->getFile(),
            'errorLine'  => $e->getLine(),
            'errorStack' => $e->getTraceAsString()
        )
    );
}

/**
 * @param $sysClassName
 * @return CMDBNetworkDeviceTable|CMDBSANSwitchTable|CMDBServerTable|CMDBStorageDeviceTable
 * @throws ErrorException
 */
function getCmdbTable($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            return new CMDBServerTable($useUserCredentials = true);
            break;
        case 'cmdb_ci_msd':
            return new CMDBStorageDeviceTable($useUserCredentials = true);
            break;
        case 'u_san_switches_storage':
            return new CMDBSANSwitchTable($useUserCredentials = true);
            break;
        case 'cmdb_ci_netgear':
            return new CMDBNetworkDeviceTable($useUserCredentials = true);
            break;
        default:
            throw new ErrorException('Unknown sys_class_name: ' . $sysClassName);
    }
}

/**
 * @param $sysClassName
 * @return array
 * @throws ErrorException
 */
function getInstallStatusHash($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            $cmdbListTable = new CMDBListTable('install_status', 'cmdb_ci_server');
            return $cmdbListTable->getHash();
            break;
        case 'cmdb_ci_msd':
            $cmdbListTable = new CMDBListTable('install_status', 'cmdb_ci_msd');
            return $cmdbListTable->getHash();
            break;
        case 'u_san_switches_storage':
            $cmdbListTable = new CMDBListTable('install_status', 'u_san_switches_storage');
            return $cmdbListTable->getHash();
            break;
        case 'cmdb_ci_netgear':
            $cmdbListTable = new CMDBListTable('install_status', 'cmdb_ci_netgear');
            return $cmdbListTable->getHash();
            break;
        default:
            throw new ErrorException('Unknown sys_class_name: ' . $sysClassName);
    }
}
