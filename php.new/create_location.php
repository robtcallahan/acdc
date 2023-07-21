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
    // get the sysId of the new location to be added to ACDC
    $sysId = $_POST['locationSysId'];

    // get all the CMDB location from the sysid
    $cmdbLocationTable = new CMDBLocationTable();
    $cmdbLocation = $cmdbLocationTable->getBySysId($sysId);

    // create the entry for our location
    $location = new Location();
    $location->setSysId($sysId)
        ->setName($cmdbLocation->getName())
        ->setStreet($cmdbLocation->getStreet())
        ->setCity($cmdbLocation->getCity())
        ->setState($cmdbLocation->getState())
        ->setZip($cmdbLocation->getZip());

    $locationsTable = new LocationTable();
    $location = $locationsTable->create($location);

	echo json_encode(
		array(
			"returnCode" => 0,
			"id"  => $location->getId()
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
