<?php
/*******************************************************************************
 *
 * $Id: save_asset.php 82954 2014-02-04 15:46:18Z rcallaha $
 * $Date: 2014-02-04 10:46:18 -0500 (Tue, 04 Feb 2014) $
 * $Author: rcallaha $
 * $Revision: 82954 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/save_asset.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBBusinessServiceTable;
use STS\CMDB\CMDBSubsystemTable;

use STS\CMDB\CMDBLocationTable;
use STS\CMDB\CMDBRackTable;
use STS\CMDB\CMDBCITable;
use STS\CMDB\CMDBCI;

use STS\CMDB\CMDBServer;
use STS\CMDB\CMDBServerTable;
use STS\CMDB\CMDBStorageDevice;
use STS\CMDB\CMDBStorageDeviceTable;
use STS\CMDB\CMDBSANSwitch;
use STS\CMDB\CMDBSANSwitchTable;
use STS\CMDB\CMDBNetworkDevice;
use STS\CMDB\CMDBNetworkDeviceTable;

use STS\CMDB\CMDBListTable;

use STS\CMDB\CMDBManufacturerTable;

use STS\Login\UserTable;
use STS\Util\SysLog;
use STS\Util\HTTPParameters;

try {
    $config = $GLOBALS['config'];

    // Set up SysLog
    $sysLog   = SysLog::singleton($config->appName);
    $logLevel = $config->logLevel;

    // get the actor info
    $userName  = $_SERVER["PHP_AUTH_USER"];
    $userTable = new UserTable();
    $actor     = $userTable->getByUserName($userName);

    $message = ""; // text to return to UI specifying an issue that occurred

    // flag to indicate if the asset was changed such that it is now found in the CMDB.
    // if so, we'll have to save the CMDB info into the asset table later
    $newlyFoundInCmdb = false;

    // POST params
    $httpParams = new HTTPParameters();
    $params     = $httpParams->getParams(array(
        'action',
        'changes',
        'isBlade',
        'source',

        'assetId',
        'sysId',
        'sysClassName',
        'assetClass',

        'name',
        'label',
        'deviceType',
        'location',
        'cabinet',
        'elevation',
        'numRUs',
        'serialNumber',
        'assetTag',
        'manufacturer',
        'model',
        'state',
        'powerStatus'
    ));

    // necessary classes
    $cmdbServerTable   = new CMDBServerTable($userUserCredentials = true);
    $cmdbCITable       = new CMDBCITable();
    $cmdbLocationTable = new CMDBLocationTable();
    $cmdbRackTable     = new CMDBRackTable();
    $cmdbManTable      = new CMDBManufacturerTable();

    $locationTable = new LocationTable();
    $location      = null;
    $cabinetTable  = new CabinetTable();
    $cabinet       = null;
    $assetTable    = new AssetTable();
    $asset         = null;

    $businessServerTable = new BusinessServiceTable();
    $subsystemTable = new SubsystemTable();

    $auditTable      = new AuditTable();
    $actionTable     = new ActionTable();
    $action          = new Action();
    $assetStateTable = new AssetStateTable();

    // get a list of state values to decode the state text that was passed (state is a separate table)
    $assetStateHash = $assetStateTable->getHashByName();
    $assetStateIds  = $assetStateTable->getHashById();

    // first, get the instances of
    switch ($params['action']) {
        case 'add':
            $cmdbCI = new \STS\CMDB\CMDBCI();

            // Get the CI record from the CMDB
            $cmdbCI = $cmdbCITable->getBySysId($params['sysId']);

            // get a list of correct install state values for this calss
            $cmdbStatusHash = getInstallStatusHash($cmdbCI->getSysClassName());
            // get a list of correct device types for this class
            $cmdbDeviceTypeHash = getDeviceType($cmdbCI->getSysClassName());
            // get the manufacturer CI
            $manufacturer = $cmdbManTable->getByName($params['manufacturer']);

            // get the sub table based upon the sys_class_name
            $cmdbTable = getCmdbTable($cmdbCI->getSysClassName());

            // get the asset
            $cmdbAsset = $cmdbTable->getBySysId($cmdbCI->getSysId());

            // get the requested location and rack from CMDB
            $cmdbLocation = $cmdbLocationTable->getByName($params['location']);
            $cmdbRack     = $cmdbRackTable->getByNameAndLocationId($params['cabinet'], $cmdbLocation->getSysId());

            // assign updates
            $cmdbAsset->setRackPosition($params['elevation'])
                ->setNumberOfRackUnits($params['numRUs'])
                ->setSerialNumber($params['serialNumber'])
                ->setAssetTag($params['assetTag']);

            // Save the CMDB CI
            if ($config->cmdbUpdate) $cmdbAsset = $cmdbTable->update($cmdbAsset);

            $asset = $assetTable->getByName($params['name']);
            if ($asset->getId()) {
                $sysLog->debug("Asset " . $asset->getName() . " exists");
                $cabinet  = $cabinetTable->getById($asset->getCabinetId());
                $location = $locationTable->getById($cabinet->getLocationId());
            } else {
                $sysLog->debug("Asset " . $params['name'] . " does not exist");
                $location = $locationTable->getByName($params['location']);
                $cabinet  = $cabinetTable->getByName($params['cabinet']);
                $asset    = new Asset();
                $asset->setName($params['name']);
            }

            // update the location first
            if ($location->getId() == '') {
                // doesn't exist locally, so create
                $location->setSysId($cmdbLocation->getSysId())
                    ->setName($cmdbLocation->getName())
                    ->setStreet($cmdbLocation->getStreet())
                    ->setCity($cmdbLocation->getCity())
                    ->setState($cmdbLocation->getState())
                    ->setZip($cmdbLocation->getZip());

                $location = $locationTable->create($location);
            }

            // now the cabinet
            if ($cabinet->getId() == '') {
                // doesn't exist locally, so create
                $cabinet->setLocationId($location->getId());
                $cabinet->setName($params['cabinet']);
                $cabinet->setCabinetTypeId(1);
                $cabinet = $cabinetTable->create($cabinet);
            }

            // ok, now we can update or create the asset
            $asset->setSysId($cmdbAsset->getSysId())
                ->setSysClassName($cmdbAsset->getSysClassName())
                ->setAssetClass($params['assetClass'])

                ->setLabel($params['label'])
                ->setDeviceType($params['deviceType'])

                ->setCabinetId($cabinet->getId())
                ->setElevation($params['elevation'])
                ->setNumRUs($params['numRUs'])

                ->setSerialNumber($params['serialNumber'])
                ->setAssetTag($params['assetTag'])
                ->setManufacturer($cmdbAsset->getManufacturer())
                ->setModel($params['model'])

                ->setAssetStateId($assetStateHash['Installed'])
                ->setPowerStatus($params['powerStatus']);

            // need to create entries in the audit table for every property that has changed
            foreach ($asset->getChanges() as $prop => $chg) {
                // if a property changed that is a foreign key, we need to get its value and add that rather than the id value for readability purposes
                if ($prop == "assetStateId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'state', $assetStateIds[$chg->originalValue], $assetStateIds[$chg->modifiedValue]);
                } else if ($prop == "cabinetId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'cabinet', $currentCabinet->getName(), $cabinet->getName());

                    if ($location->getId() != $currentLocation->getId()) {
                        $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'location', $currentLocation->getName(), $location->getName());
                    }
                } else {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
            }

            if ($asset->getId()) {
                $sysLog->debug("Updating " . $asset->getName());
                $assetTable->update($asset);
            } else {
                $sysLog->debug("Creating " . $asset->getName());
                $asset = $assetTable->create($asset);
            }
            $params['assetId'] = $asset->getId();
            break;

        case 'update':
            /**
             * Update needs to handle the following state values:
             *      In Transit
             *      Repurposed
             *      Relocated On-Site
             *      Relocated Off-Site
             *      Decommed On-Tile
             *      Decommed Off-Tile
             *      Decommed Off-Site
             *      Awaiting Disposal
             *      Disposed
             */
            if ($params['isBlade']) {
                // blades are not yet supported
                echo json_encode(
                    array(
                        'returnCode' => 0,
                        'message'    => $message != "" ? $message : ""
                    )
                );
                exit;
            }

            $asset = $assetTable->getById($params['assetId']);

            if ($asset->getCabinetId()) {
                $currentCabinet  = $cabinetTable->getById($asset->getCabinetId());
                $currentLocation = $locationTable->getById($currentCabinet->getLocationId());
            } else {
                $currentCabinet  = new Cabinet();
                $currentLocation = new Location();
            }

            // update the location first
            $location = $locationTable->getByName($params['location']);
            if ($location->getId() == '') {
                // doesn't exist locally, so create
                $cmdbLocation = $cmdbLocationTable->getByName($params['location']);
                $location->setSysId($cmdbLocation->getSysId())
                    ->setName($cmdbLocation->getName())
                    ->setStreet($cmdbLocation->getStreet())
                    ->setCity($cmdbLocation->getCity())
                    ->setState($cmdbLocation->getState())
                    ->setZip($cmdbLocation->getZip());

                $location = $locationTable->create($location);
            }

            // now the cabinet
            $cabinet = $cabinetTable->getByName($params['cabinet']);
            if ($cabinet->getId() == '') {
                // doesn't exist locally, so create
                $cabinet->setLocationId($location->getId());
                $cabinet->setName($params['cabinet']);
                $cabinet->setCabinetTypeId(1);
                $cabinet = $cabinetTable->create($cabinet);
            }

            // check to see what changed so that we can specify an action of 'Relocated' if appropriate
            if ($location->getName() != "" && $location->getName() != null && $location->getName() != $params['location']) {
                // Relocated Off-Site
                $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), ActionTable::RELOCATED_OFFSITE);
            } else if (($cabinet->getName() != "" && $cabinet->getName() != null && $cabinet->getId() != $asset->getCabinetId()) || $params['elevation'] != $asset->getElevation()) {
                // Relocated On-Site
                $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), ActionTable::RELOCATED_ONSITE);
            } else if ($params['label'] != $asset->getLabel()) {
                // Repurposed
                $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), ActionTable::REPURPOSED);
            } else if ($params['state'] != $asset->getState()) {
                // In Transit, Decommed *, Awaiting Disposal or Disposed
                $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), $params['state']);

                // if asset is in transit, decommed and not on-tile, awaiting disposal or disposed,
                // clear asset cabinet id and elevation
                // clear CMDB CI location, rack and elevation
                if ($params['state'] != 'Decommed On-Tile') {
                    // clear the cabinet and elevation properties
                    $asset->setCabinetId(null)
                        ->setElevation(null);

                    // setting cabinet sys id to null so that when we save the CMDB CI it clears the rack sys id
                    $cabinet->setSysId(null);
                    $location->setSysId(null);
                }
            } else {
                $asset->setCabinetId($cabinet->getId())
                    ->setElevation($params['elevation']);
            }

            // set all the asset values
            $asset
                ->setSysClassName($params['sysClassName'])
                ->setAssetClass($params['assetClass'])
                ->setSysId($params['sysId'])

                ->setName($params['name'])
                ->setLabel($params['label'])
                ->setDeviceType($params['deviceType'])

                ->setCabinetId($cabinet->getId())
                ->setElevation($params['elevation'])
                ->setNumRUs($params['numRUs'])

                ->setSerialNumber($params['serialNumber'])
                ->setAssetTag($params['assetTag'])
                ->setManufacturer($params['manufacturer'])
                ->setModel($params['model'])

                ->setAssetStateId($assetStateHash[$params['state']])
                ->setPowerStatus($params['powerStatus']);

            // need to create entries in the audit table for every property that has changed
            foreach ($asset->getChanges() as $prop => $chg) {
                // if a property changed that is a foreign key, we need to get its value and add that rather than the id value for readability purposes
                if ($prop == "assetStateId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'state', $assetStateIds[$chg->originalValue], $assetStateIds[$chg->modifiedValue]);
                } else if ($prop == "cabinetId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'cabinet', $currentCabinet->getName(), $cabinet->getName());

                    if ($location->getId() != $currentLocation->getId()) {
                        $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'location', $currentLocation->getName(), $location->getName());
                    }
                } else {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
            }

            // now we can save the asset locally
            $asset = $assetTable->update($asset);

            // Update the CMDB CI
            $cmdbCI = new \STS\CMDB\CMDBCI();

            // Get the CI record from the CMDB
            if ($asset->getSysId())
            {
                // here we have the sysId defined in the asset table
                $cmdbCI = $cmdbCITable->getBySysId($asset->getSysId());
            }
            else
            {
                $cmdbCI = cmdbLookup($asset);
                if (!$cmdbCI->getSysId()) {
                    $returnCode = 1;
                    $message    = "The asset was saved locally, but the CMDB CI could not be found.";
                }
                $newlyFoundInCmdb = true;
            }

            if ($cmdbCI->getSysId()) {
                // if the CI was found, get the sub table based upon the sys_class_name
                $cmdbTable = getCmdbTable($asset->getSysClassName());

                // get a list of correct install state values for this calss
                $cmdbStatusHash = getInstallStatusHash($asset->getSysClassName());
                // get a list of correct device types for this class
                $cmdbDeviceTypeHash = getDeviceType($asset->getSysClassName());
                // get the manufacturer CI
                $manufacturer = $cmdbManTable->getByName($params['manufacturer']);

                // get the asset
                $cmdbAsset = $cmdbTable->getBySysId($cmdbCI->getSysId());

                $cmdbAsset
                    ->setLocationId($location->getSysId() ? $location->getSysId() : "")
                    ->setRackId($cabinet->getSysId() ? $cabinet->getSysId() : "")
                    ->setRackPosition($asset->getElevation() ? $asset->getElevation() : "")
                    ->setNumberOfRackUnits($asset->getNumRUs())
                    ->setAssetTag($asset->getAssetTag())
                    ->setSerialNumber($asset->getSerialNumber())
                    ->setManufacturerId($manufacturer->getSysId());

                // if SAN switch, there is no device type, so check before we assign
                if ($params['deviceType'] && array_key_exists($params['deviceType'], $cmdbDeviceTypeHash)) {
                    $cmdbAsset->setDeviceTypeId($cmdbDeviceTypeHash[$params['deviceType']]);
                } else {

                }

                // set the CMDB CI Install Status. Save the current value so we can update the audit table later
                $installStatus = $asset->getInstallStatus();
                if ($action->getAction() == ActionTable::IN_TRANSIT) {
                    // CMDB CI status = Staging
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Staging']);
                    $asset->setInstallStatus('Staging');
                } else if (preg_match("/Decommed/", $action->getAction())) {
                    // CMDB CI status = Decommissioning
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Inventory']);
                    $asset->setInstallStatus('Inventory');
                } else if ($action->getAction() == $actionTable::AWAITING_DISPOSAL) {
                    // CMDB CI status = Awaiting Disposal
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Disposed']);
                    $asset->setInstallStatus('Disposed');
                } else if ($action->getAction() == $actionTable::DISPOSED) {
                    // CMDB CI status = Disposed
                    $cmdbAsset->setInstallStatusId($cmdbStatusHash['Disposed']);
                    $asset->setInstallStatus('Disposed');
                }

                // make sure that we have the business service and subsystem in our tables
                $bsIds = explode(",", $cmdbAsset->getBusinessServicesIds());
                $bsId = null;
                if (is_array($bsIds) && count($bsIds) > 0) {
                    $bsId = $bsIds[0];
                    $businessService = $businessServerTable->getBySysId($bsId);

                    // this BS doesn't exist in ACDC, so create
                    if ($businessService->getSysId() == null) {
                        $bs = $cmdbBSTable->getById($bsId);
                        $businessService
                            ->setName($bs->getName())
                            ->setSysId($bsId);
                        $businessService = $businessServerTable->create($businessService);
                    }
                } else {
                    // no BS for this cmdb asset
                    $bsId = null;
                }
                $idsArray = explode(",", $cmdbAsset->getSubsystemListId());
                $subsystemId = $idsArray[0];
                $namesArray = explode(",", $cmdbAsset->getSubsystemList());
                $subsystemName = $namesArray[0];

                $subsystem = $subsystemTable->getBySysId($subsystemId);
                if ($subsystem->getSysId() == null) {
                    $subsystem
                        ->setName($subsystemName)
                        ->setSysId($subsystemId);
                    $subsystem = $subsystemTable->create($subsystem);
                }

                // Save the CMDB CI
                if ($config->cmdbUpdate) $cmdbAsset = $cmdbTable->update($cmdbAsset);

                // first time asset was found in the CMDB so update the asset with CMDB info
                if ($newlyFoundInCmdb) {
                    $asset
                        ->setSysId($cmdbAsset->getSysId())
                        ->setSysClassName($cmdbAsset->getSysClassName())
                        ->setAssetClass(getAssetClass($cmdbAsset->getSysClassName()))
                        ->setDeviceType($cmdbAsset->getSysClassName() == "cmdb_ci_server" ? $cmdbAsset->getHostType() : $cmdbAsset->getDeviceType())
                        ->setName(strtolower($cmdbAsset->getName()))
                        ->setManufacturer($cmdbAsset->getManufacturer())
                        ->setInstallStatus($cmdbAsset->getInstallStatus())
                        ->setBusinessServiceSysId($bsId)
                        ->setSubsystemSysId($subsystemId);

                    $message = "Asset was found in the CMDB and updated.\n";
                } else {
                    $asset
                        ->setName(strtolower($cmdbAsset->getName()))
                        ->setSysClassName($cmdbAsset->getSysClassName())
                        ->setAssetClass(getAssetClass($cmdbAsset->getSysClassName()))
                        ->setDeviceType($cmdbAsset->getSysClassName() == "cmdb_ci_server" ? $cmdbAsset->getHostType() : $cmdbAsset->getDeviceType())
                        ->setInstallStatus($cmdbAsset->getInstallStatus())
                        ->setBusinessServiceSysId($bsId)
                        ->setSubsystemSysId($subsystemId);
                }

                // if the CMDB CI Install Status changed, then we updated the asset's install status so we need to save it
                // and add an entry to the audit table as well
                // need to create entries in the audit table for every property that has changed
                foreach ($asset->getChanges() as $prop => $chg) {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
                $asset = $assetTable->update($asset);
            } else {
                $returnCode = 1;
                $message    = "The asset was saved locally, but the CMDB CI could not be found.";
            }
            break;

        case
        'install':
            // the source parameter specifies how the asset was found during the initial asset lookup. value is one of:
            // cmdb - asset was found in cmdb. A cmdb CI update will be required
            // new - asset was not found in cmdb. A cmdb CI create will be required
            switch ($params['source']) {
                case 'cmdb':
                    // installed asset is not part of a workflow task, but is currently in cmdb
                    $cmdbAsset = $cmdbCITable->getBySysId($params['sysId']);

                    // get the requested location and rack from CMDB
                    $cmdbLocation = $cmdbLocationTable->getByName($params['location']);
                    $cmdbRack     = $cmdbRackTable->getMostRecentByNameAndLocationId($params['cabinet'], $cmdbLocation->getSysId());

                    // get the sys class name from asset class with is an english string
                    $sysClassName = getSysClassName($params['assetClass']);

                    // get a list of install status values for this CI
                    $statusHash = getInstallStatusHash($sysClassName);

                    // get a new instance of the appropriate class
                    $cmdbAsset = getCmdbClass($sysClassName);

                    // get a list of device types
                    $cmdbDeviceTypeHash = getDeviceType($sysClassName);

                    $manufacturer = $cmdbManTable->getByName($params['manufacturer']);

                    // now we can update the asset in CMDB including changing the status to 'Staging'
                    $cmdbAsset->setLocationId($cmdbLocation->getSysId())
                        ->setRackId($cmdbRack->getSysId())
                        ->setRackPosition($params['elevation'])
                        ->setNumberOfRackUnits($params['numRUs'])
                        ->setSerialNumber($params['serialNumber'])
                        ->setAssetTag($params['assetTag'])
                        ->setInstallStatusId($statusHash['Staging'])
                        ->setManufacturerId($manufacturer->getSysId())
                        ->setModelNumber($params['model']);

                    // if SAN switch, there is no device type, so check before we assign
                    if ($params['deviceType'] && array_key_exists($params['deviceType'], $cmdbDeviceTypeHash)) {
                        $cmdbAsset->setDeviceTypeId($cmdbDeviceTypeHash[$params['deviceType']]);
                    }

                    $cmdbTable = getCmdbTable($sysClassName);
                    if ($config->cmdbUpdate) $cmdbAsset = $cmdbTable->update($cmdbAsset);
                    break;
                case 'new':
                    $sysLog->debug("Executing NEW install function");

                    // the installed asset is not found in cmdb and therefore must be created with a special BS and Subsystem
                    $cmdbBSTable = new CMDBBusinessServiceTable();
                    $cmdbBS      = $cmdbBSTable->getByName($config->installedBusinessService);
                    $cmdbSSTable = new CMDBSubsystemTable();
                    $cmdbSS      = $cmdbSSTable->getByName($config->installedSubsystem);

                    // get the requested location and rack from CMDB
                    $cmdbLocation = $cmdbLocationTable->getByName($params['location']);
                    $cmdbRack     = $cmdbRackTable->getMostRecentByNameAndLocationId($params['cabinet'], $cmdbLocation->getSysId());

                    // get the sys class name from asset class with is an english string
                    $sysClassName = getSysClassName($params['assetClass']);
                    $sysLog->debug("sysClassName=" . $sysClassName);

                    // get a list of install status values for this CI
                    $statusHash = getInstallStatusHash($sysClassName);

                    // get a new instance of the appropriate class
                    $cmdbAsset = getCmdbClass($sysClassName);

                    $manufacturer = $cmdbManTable->getByName($params['manufacturer']);

                    $cmdbListTable        = new CMDBListTable('u_location_type', 'cmdb_ci_server');
                    $cmdbLocationTypeHash = $cmdbListTable->getHash();
                    $cmdbListTable        = new CMDBListTable('u_environment', 'cmdb_ci');
                    $cmdbEnvHash          = $cmdbListTable->getHash();

                    $cmdbDeviceTypeHash = getDeviceType($sysClassName);

                    // assign the values
                    $cmdbAsset->setName($params['name'])
                        #->setIpAddress('x.x.x.x')
                        #->setLocationTypeId($cmdbLocationTypeHash['Neustar Data Center'])
                        #->setEnvironmentId($cmdbEnvHash['No Environment'])

                        ->setManufacturerId($manufacturer->getSysId())
                        ->setModelNumber($params['model'])

                        ->setBusinessServiceId($cmdbBS->getSysId())
                        ->setBusinessServicesIds($cmdbBS->getSysId())
                        ->setSubsystemListId($cmdbSS->getSysId())

                        ->setLocationId($cmdbLocation->getSysId())
                        ->setRackId($cmdbRack->getSysId())
                        ->setRackPosition($params['elevation'])
                        ->setNumberOfRackUnits($params['numRUs'])

                        ->setSerialNumber($params['serialNumber'])
                        ->setAssetTag($params['assetTag'])
                        ->setInstallStatusId($statusHash['Staging'])

                        ->setDataSource('acdc');

                    // if SAN switch, there is no device type, so check before we assign
                    if ($params['deviceType'] && array_key_exists($params['deviceType'], $cmdbDeviceTypeHash)) {
                        $cmdbAsset->setDeviceTypeId($cmdbDeviceTypeHash[$params['deviceType']]);
                    }

                    $cmdbTable = getCmdbTable($sysClassName);

                    $sysLog->debug("Creating new CI");
                    if ($config->cmdbUpdate) $cmdbAsset = $cmdbTable->create($cmdbAsset);
                    break;
                default:
                    throw new ErrorException('Unknown source: ' . $params['source']);
            }

            // since this is an install, we don't know if the asset exists in our local DB. The asset info was pulled from CMDB
            // therefore, we need to check to see if it exists locally first
            $sysLog->debug("Checking for local instance of " . $params['label']);

            $asset = $assetTable->getByLabel($params['label']);
            if ($asset->getId()) {
                $sysLog->debug("Asset " . $asset->getLabel() . " exists");
                $cabinet  = $cabinetTable->getById($asset->getCabinetId());
                $location = $locationTable->getById($cabinet->getLocationId());
            } else {
                $sysLog->debug("Asset " . $params['label'] . " does not exist");
                $location = $locationTable->getByName($params['location']);
                $cabinet  = $cabinetTable->getByName($params['cabinet']);
                $asset    = new Asset();
                $asset->setName($params['name']);
            }


            // update the location first
            if ($location->getId() == '') {
                // doesn't exist locally, so create
                $location->setSysId($cmdbLocation->getSysId())
                    ->setName($cmdbLocation->getName())
                    ->setStreet($cmdbLocation->getStreet())
                    ->setCity($cmdbLocation->getCity())
                    ->setState($cmdbLocation->getState())
                    ->setZip($cmdbLocation->getZip());

                $location = $locationTable->create($location);
            }

            // now the cabinet
            if ($cabinet->getId() == '') {
                // doesn't exist locally, so create
                $cabinet->setLocationId($location->getId());
                $cabinet->setName($params['cabinet']);
                $cabinet->setCabinetTypeId(1);
                $cabinet = $cabinetTable->create($cabinet);
            }

            // ok, now we can update or create the asset
            $asset->setSysClassName($params['sysClassName'])
                ->setAssetClass($params['assetClass'])
                ->setSysId($cmdbAsset->getSysId())

                ->setLabel($params['label'])
                ->setDeviceType($params['deviceType'])

                ->setCabinetId($cabinet->getId())
                ->setElevation($params['elevation'])
                ->setNumRUs($params['numRUs'])

                ->setSerialNumber($params['serialNumber'])
                ->setAssetTag($params['assetTag'])
                ->setManufacturer($cmdbAsset->getManufacturer())
                ->setModel($cmdbAsset->getModelNumber())

                ->setAssetStateId($assetStateHash['Installed'])
                ->setPowerStatus($params['powerStatus'])

                ->setLastUpdate(date('Y-m-d h:i:s'));

            // save the asset. If new, we need the id to populate the audit table
            if ($asset->getId()) {
                $sysLog->debug("Updating " . $asset->getName());
                $assetTable->update($asset);
            } else {
                $sysLog->debug("Creating " . $asset->getName());
                $asset = $assetTable->create($asset);
            }

            // need to create entries in the audit table for every property that has changed
            foreach ($asset->getChanges() as $prop => $chg) {
                // if a property changed that is a foreign key, we need to get its value and add that rather than the id value for readability purposes
                if ($prop == "assetStateId") {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'state', '', $assetStateIds[$chg->modifiedValue]);
                } else if ($prop == "cabinetId") {
                    //$audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'cabinet', $currentCabinet->getName(), $cabinet->getName());
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'cabinet', '', $cabinet->getName());
                } else if ($prop == "locationId") {
                    //$audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'location', $currentLocation->getName(), $location->getName());
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), 'location', '', $location->getName());
                } else {
                    $audit = $auditTable->createEntry($asset->getId(), $actor->getId(), $prop, $chg->originalValue, $chg->modifiedValue);
                }
            }

            // update the action table indicating a new install
            $action = $actionTable->createEntry($asset->getId(), $asset->getSysId(), $actor->getId(), ActionTable::INSTALLED);

            //$params['assetId'] = $asset->getId();
            break;

    }

    // TODO: check for changed return code and errorText

    echo json_encode(
        array(
            'returnCode' => 0,
            'message'    => $message != "" ? $message : "",
            'newlyFoundInCmdb' => $newlyFoundInCmdb ? 1 : 0
        )
    );
} catch (Exception $e) {
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
 * @param $assetClass
 * @return string
 * @throws ErrorException
 */
function getSysClassName($assetClass)
{
    switch ($assetClass) {
        case 'Host':
            return 'cmdb_ci_server';
            break;
        case 'Storage':
            return 'cmdb_ci_msd';
            break;
        case 'SAN Switch':
            return 'u_san_switches_storage';
            break;
        case 'Network Gear':
            return 'cmdb_ci_netgear';
            break;
        default:
            throw new ErrorException('Unknown assetClass: ' . $assetClass);
    }
}

/**
 * @param $sysClassName
 * @return CMDBNetworkDevice|CMDBSANSwitch|CMDBServer|CMDBStorageDevice
 * @throws ErrorException
 */
function getCmdbClass($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            return new CMDBServer();
            break;
        case 'cmdb_ci_msd':
            return new CMDBStorageDevice();
            break;
        case 'u_san_switches_storage':
            return new CMDBSANSwitch();
            break;
        case 'cmdb_ci_netgear':
            return new CMDBNetworkDevice();
            break;
        default:
            throw new ErrorException('Unknown sys_class_name: ' . $sysClassName);
    }
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

function getAssetClass($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            return 'Host';
            break;
        case 'cmdb_ci_msd':
            return 'Storage';
            break;
        case 'u_san_switches_storage':
            return 'SAN Switch';
            break;
        case 'cmdb_ci_netgear':
            return 'Network Gear';
            break;
        default:
            throw new ErrorException('Unknown assetClass: ' . $sysClassName);
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

function getDeviceType($sysClassName)
{
    switch ($sysClassName) {
        case 'cmdb_ci_server':
            $cmdbListTable = new CMDBListTable('u_host_type', 'cmdb_ci_server');
            return $cmdbListTable->getHash();
            break;
        case 'cmdb_ci_msd':
            $cmdbListTable = new CMDBListTable('device_type', 'cmdb_ci_msd');
            return $cmdbListTable->getHash();
            break;
        case 'u_san_switches_storage':
            $cmdbListTable = new CMDBListTable('device_type', 'u_san_switches_storage');
            return $cmdbListTable->getHash();
            break;
        case 'cmdb_ci_netgear':
            $cmdbListTable = new CMDBListTable('device_type', 'cmdb_ci_netgear');
            return $cmdbListTable->getHash();
            break;
        default:
            throw new ErrorException('Unknown sys_class_name: ' . $sysClassName);
    }
}

function cmdbLookup(Asset $asset)
{
    $baseQuery = "^sys_class_name=cmdb_ci_server^ORsys_class_name=cmdb_ci_msd^ORsys_class_name=u_san_switches_storage^ORsys_class_name=cmdb_ci_netgear";

    $cmdbCiTable = new CMDBCITable();
    $assetExceptionTable = new AssetExceptionTable();

    $ci = new CMDBCI();

    // Search by Name and Serial Number
    $query   = "nameSTARTSWITH" . $asset->getLabel() . "." . "^serial_number=" . $asset->getSerialNumber() . $baseQuery;
    $results = array();
    if ($asset->getSerialNumber()) {
        $results = $cmdbCiTable->getByQueryString($query);
    }

    if (count($results) > 1) {
        // create/update the exception
        $exc = new AssetException();
        $exc->setAssetId($asset->getId())
            ->setExceptionType(AssetExceptionTable::MULTIPLEMATCHES);
        $detailStr = "";
        foreach ($results as $r) {
            $detailStr .= "Name: " . $r->getName() . ", SN: " . $r->getSerialNumber() . ", Man: " . $r->getManufacturer() . ", Model: " . $r->getModelNumber() . "\n";
        }
        $exc->setExceptionDetails($detailStr);
        $assetExceptionTable->save($exc);
        return $ci;
    } else if (count($results) == 1) {
        $ci = $results[0];
        $asset->setFoundBy("HN and SN");
    } else {
        // search by serial number
        $query   = "serial_number=" . $asset->getSerialNumber() . $baseQuery;
        $results = array();
        if ($asset->getSerialNumber()) {
            $results = $cmdbCiTable->getByQueryString($query);
        }
        if (count($results) > 1) {
            // create/update the exception
            $exc = new AssetException();
            $exc->setAssetId($asset->getId())
                ->setExceptionType(AssetExceptionTable::MULTIPLEMATCHES);
            $detailStr = "";
            foreach ($results as $r) {
                $detailStr .= "Name: " . $r->getName() . ", SN: " . $r->getSerialNumber() . ", Man: " . $r->getManufacturer() . ", Model: " . $r->getModelNumber() . "\n";
            }
            $exc->setExceptionDetails($detailStr);
            $assetExceptionTable->save($exc);
            return $ci;
        } else if (count($results) == 1) {
            $ci = $results[0];
            $asset->setFoundBy("SN");
        } else {
            // search by host name
            $query   = "nameSTARTSWITH" . $asset->getLabel() . "." . $baseQuery;
            $results = $cmdbCiTable->getByQueryString($query);
            if (count($results) > 1) {
                // create/update the exception
                $exc = new AssetException();
                $exc->setAssetId($asset->getId())
                    ->setExceptionType(AssetExceptionTable::MULTIPLEMATCHES);
                $detailStr = "";
                foreach ($results as $r) {
                    $detailStr .= "Name: " . $r->getName() . ", SN: " . $r->getSerialNumber() . ", Man: " . $r->getManufacturer() . ", Model: " . $r->getModelNumber() . "\n";
                }
                $exc->setExceptionDetails($detailStr);
                $assetExceptionTable->save($exc);
                return $ci;
            } else if (count($results) == 0) {
                $query   = "name=" . $asset->getLabel() . $baseQuery;
                $results = $cmdbCiTable->getByQueryString($query);
            }

            if (count($results) > 1) {
                // create/update the exception
                $exc = new AssetException();
                $exc->setAssetId($asset->getId())
                    ->setExceptionType(AssetExceptionTable::MULTIPLEMATCHES);
                $detailStr = "";
                foreach ($results as $r) {
                    $detailStr .= "Name: " . $r->getName() . ", SN: " . $r->getSerialNumber() . ", Man: " . $r->getManufacturer() . ", Model: " . $r->getModelNumber() . "\n";
                }
                $exc->setExceptionDetails($detailStr);
                $assetExceptionTable->save($exc);
                return $ci;
            }
            else if (count($results) == 1) {
                /** @var CMDBCI $ci */
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

                if ($ci->getSerialNumber() == "" && $asset->getSerialNumber())
                {
                    $ci->setSerialNumber($asset->getSerialNumber());
                    $ci = $cmdbCiTable->update($ci);
                }
                else if (($ci->getSerialNumber() && !$asset->getSerialNumber()) || (preg_replace("/-/", "", $ci->getSerialNumber()) == $asset->getSerialNumber()))
                {
                    $asset->setSerialNumber(strtoupper($ci->getSerialNumber()));
                }
                else if ($ci->getSerialNumber() != $asset->getSerialNumber())
                {
                    // create/update the exception
                    $exc = new AssetException();
                    $exc->setAssetId($asset->getId())
                        ->setExceptionType(AssetExceptionTable::SNMISMISMATCH)
                        ->setExceptionDetails("CMDB: " . $ci->getSerialNumber() . " != ACDC: " . $asset->getSerialNumber());
                    $assetExceptionTable->save($exc);
                    return $ci;
                }
                else
                {
                    // both CMDB and ACDC SNs are blank. copy the CMDB name to ACDC name
                    $asset->setName($ci->getName());
                }
                $asset->setFoundBy("HN");
            } else {
                // create/update the exception
                $exc = new AssetException();
                $exc->setAssetId($asset->getId())
                    ->setExceptionType(AssetExceptionTable::NOTFOUND);
                $assetExceptionTable->save($exc);
                return $ci;
            }
        }
    }
    // asset was found. If exception exists then delete it
    $exc = $assetExceptionTable->getByAssetId($asset->getId());
    if ($exc->getId()) {
        $assetExceptionTable->delete($exc);
    }
    return $ci;
}

