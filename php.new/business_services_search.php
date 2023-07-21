<?php
/*******************************************************************************
 *
 * $Id: business_services_search.php 79857 2013-10-14 19:44:45Z rcallaha $
 * $Date: 2013-10-14 15:44:45 -0400 (Mon, 14 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 79857 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/business_services_search.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try
{
	$config = $GLOBALS['config'];

	$query = $_POST['query'];

    $bsTable = new BusinessServiceTable();

	$data = array();

    // search by BS name
    $businessServices = $bsTable->getByNameLike($query);
    foreach ($businessServices as $bs) {
		$hash = array(
			"sysId"    => $bs->getSysId(),
			"name" => $bs->getName()
		);
		$data[] = $hash;
	}

	echo json_encode(
		array(
			"returnCode" => 0,
			"total"      => count($data),
			"businessServices"  => $data
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
