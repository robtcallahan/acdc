<?php
/*******************************************************************************
 *
 * $Id: get_logins.php 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_logins.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBLocationTable;

try 
{
    // get any substring that's passed
    $substring = array_key_exists('query', $_POST) ? $_POST['query'] : null;

    // get the ACDC known locations
    $locationsTable = new LocationTable();
    $locations = $locationsTable->getAll();

    // create a hash of used locations
    $locationsHash = array();
    foreach ($locations as $l) {
        $locationsHash[$l->getSysId()] = $l;
    }

    // get all the CMDB locations
    $cmdbLocationTable = new CMDBLocationTable();
    if ($substring) {
        $cmdbLocations = $cmdbLocationTable->getByQueryString("nameLIKE{$substring}");
    } else {
        $cmdbLocations = $cmdbLocationTable->getAll();
    }

    // This function will provide CMDB locations not currently used by ACDC
    // so we will filter out used locations for the drop down of "New Location"
	$data = array();
    foreach ($cmdbLocations as $l) {
        if (array_key_exists($l->getSysId(), $locationsHash)) continue;

        $data[] = array(
            "sysId" => $l->getSysId(),
            "name" => $l->getName()
        );
    }

	echo json_encode(
		array(
			"returnCode" => 0,
			"errorCode"  => 0,
			"errorText"  => "",
			"count"      => count($data),
			"locations"  => $data
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
