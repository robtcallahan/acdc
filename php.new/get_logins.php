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

	$loginTable = new LoginTable();
	$loginTable->record($actor->getId());
	
	$logins = $loginTable->getAll();

	$data = array();
	for ($i=0; $i<count($logins); $i++)
	{
		$l = $logins[$i];

		$browser = "unknown";
		$platform = "unknown";
		$dept = "unknown";
		if (preg_match("/MS(IE)|(Chrome)|(Safari)|(Firefox)|(Opera)/", $l->getUserAgent(), $m))
		{
			$browser = $m[count($m)-1];
		}
		if (preg_match("/(Windows)|(Mac)/", $l->getUserAgent(), $m))
		{
			$platform = $m[count($m)-1];
		}
		$dept = preg_replace("/^\d+ - /", "", $l->getDept());
		$data[] = (object) array(
			"id" => $l->getId(),
			"empId" => $l->getEmpId(),
			"lastName" => $l->getLastName(),
			"firstName" => $l->getFirstName(),
			"username" => $l->getUserName(),
			"title" => $l->getTitle(),
			"dept" => $dept,
			"numLogins" => $l->getNumLogins(),
			"lastLogin" => $l->getLastLogin(),
			"ipAddr" => $l->getIpAddr(),
			"browser" => $browser,
			"platform" => $platform
			);
	}

	echo json_encode(
		array(
			"returnCode" => 0,
			"errorCode"  => 0,
			"errorText"  => "",
			"count"      => count($data),
			"logins"     => $data
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
