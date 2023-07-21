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

use STS\Login\LoginTable;
use STS\Login\UserTable;

try 
{
	// get the user and update the page view
	$userName = $_SERVER["PHP_AUTH_USER"];	
	$userTable = new UserTable();
	$actor = $userTable->getByUserName($userName);

    $locationsTable = new LocationTable();
    $locations = $locationsTable->getAll();

	$data = array();
    foreach ($locations as $location) {
        $data[] = $location->toObject();
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
