<?php
/*******************************************************************************
 *
 * $Id: lookup_asset.php 81526 2013-11-28 19:27:43Z rcallaha $
 * $Date: 2013-11-28 14:27:43 -0500 (Thu, 28 Nov 2013) $
 * $Author: rcallaha $
 * $Revision: 81526 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/lookup_asset.php $
 *
 *******************************************************************************
 */

include __DIR__ . '/../config/global.php';

use STS\CMDB\CMDBCITable;
use STS\CMDB\CMDBServerTable;
use STS\CMDB\CMDBStorageDeviceTable;
use STS\CMDB\CMDBSANSwitchTable;
use STS\CMDB\CMDBNetworkDeviceTable;

use STS\CMDB\CMDBSubsystemTable;

use STS\Util\SysLog;

try {
	$config = $GLOBALS['config'];
   	$snSite = $config->servicenow->site;
   	$snConfig = $config->servicenow->$snSite;

	// Set up SysLog
	$sysLog   = SysLog::singleton($config->appName);
	$logLevel = $config->logLevel;

	$query    = $_POST['query'];

    $cmdbSubsystemTable = new CMDBSubsystemTable();

    $cmdbCITable = new CMDBCITable();
    $cmdbServerTable        = new CMDBServerTable();
   	$cmdbStorageTable       = new CMDBStorageDeviceTable();
   	$cmdbSanSwitchTable     = new CMDBSanSwitchTable();
   	$cmdbNetworkDeviceTable = new CMDBNetworkDeviceTable();

    // hash of CI names to refer to later insuring that we don't duplicate names
    $ciNameHash = array();

    $items = array();

    $cis = $cmdbCITable->getAllByNameLike($query);
    $cis = array_merge($cis, $cmdbCITable->getBySerialNumberLike($query));
    $cis = array_merge($cis, $cmdbCITable->getByAssetTagLike($query));

    for ($i = 0; $i < count($cis); $i++) {
        /** @var STS\CMDB\CMDBCI $ci */
        $ci = $cis[$i];

        // only known sys classes included
        if (!preg_match('/cmdb_ci_server|cmdb_ci_msd|u_san_switches_storage|cmdb_ci_netgear/', $ci->getSysClassName())) continue;

        $cmdbCI = null;
        $assetClass = null;
        switch ($ci->getSysClassName()) {
            case 'cmdb_ci_server':
                $cmdbCI = $cmdbServerTable->getById($ci->getSysId());
                $assetClass = 'Host';

                // we need to exclude blades and VMs since they are not a part of ACDC
                // we're only going to include chassis and standalone hosts
                if ($cmdbCI->getHostType() != "Blade Chassis" || $cmdbCI->getHostType() != "Standalone Host") {
                    continue;
                }
                break;
            case 'cmdb_ci_msd':
                $cmdbCI = $cmdbStorageTable->getById($ci->getSysId());
                $assetClass = 'Storage';
                break;
            case 'u_san_switches_storage':
                $cmdbCI = $cmdbSanSwitchTable->getById($ci->getSysId());
                $assetClass = 'SAN Switch';
                break;
            case 'cmdb_ci_netgear':
                $cmdbCI = $cmdbNetworkDeviceTable->getById($ci->getSysId());
                $assetClass = 'Network Gear';
                break;
            default:
                continue;
        }

        $subsystem  = $cmdbSubsystemTable->getBySysId($cmdbCI->getSubsystemListId());
        $cmdbUrl  = "https://" . $snConfig->server . "/nav_to.do?uri=" . $cmdbCI->getSysClassName() . ".do?sys_id=" . $cmdbCI->getSysId();
        $cmdbLink = "<span title='Click to go to the CMDB entry' style='text-decoration: underline;cursor:pointer;' onclick=window.open('" . $cmdbUrl . "','_blank');>" . $cmdbCI->getName() . "</span>";

        $label = $cmdbCI->getName();
        if (preg_match("/^([\w\d-_]+)\..*$/", $label, $m)) {
            $label = $m[1];
        }

        $items[] = array(
            'id'   => $ci->getSysId(),
            'sysId'             => $cmdbCI->getSysId(),
            'name' => $ci->getName(),
            'cmdbLink'          => $cmdbLink,

            'sysClassName' => $ci->getSysClassName(),
            'assetClass' => $assetClass,

            'label' => $label,
            'serialNumber'      => $cmdbCI->getSerialNumber(),
            'assetTag'          => $cmdbCI->getAssetTag(),

            'locationType'      => $cmdbCI->getLocationType(),
            'location'          => $cmdbCI->getLocation(),
            'cabinet'           => $cmdbCI->getRack(),
            'elevation'         => $cmdbCI->getRackPosition(),
            'numRUs'            => $cmdbCI->getNumberOfRackUnits(),

            'deviceType'        => $cmdbCI->getSysClassName() == 'cmdb_ci_server' ? $cmdbCI->getHostType() : $cmdbCI->getDeviceType(),
            'manufacturer'      => $cmdbCI->getManufacturer(),
            'model'             => $cmdbCI->getModelNumber(),

            'installStatus'   => $cmdbCI->getInstallStatus(),
            'environment'     => $cmdbCI->getEnvironment(),

            'businessService' => $cmdbCI->getBusinessService(),
            'subsystem'       => $subsystem->getName(),
            'owningSuppMgr'     => $subsystem->getOwningSupportManager(),
            'opsSuppGroup'      => $subsystem->getOperationsSupportGroup()
        );
    }

	echo json_encode(
		array(
			'returnCode' => 0,
			'errorCode'  => 0,
			'errorText'  => '',
			'total'      => count($items),
			'items'      => $items
		)
	);
}

catch
	(Exception $e)
{
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
