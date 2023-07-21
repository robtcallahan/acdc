<?php
/*******************************************************************************
 *
 * $Id: send_feedback.php 82443 2014-01-03 14:28:19Z rcallaha $
 * $Date: 2014-01-03 09:28:19 -0500 (Fri, 03 Jan 2014) $
 * $Author: rcallaha $
 * $Revision: 82443 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/send_feedback.php $
 *
 *******************************************************************************
 */
 
include __DIR__ . "/../config/global.php";

use STS\Login\UserTable;

try
{
	// get the user and update the page view
	$userName = $_SERVER["PHP_AUTH_USER"];	
	$userTable = new UserTable();
	$actor = $userTable->getByUserName($userName);

	$emailFrom = $actor->get("email");
	$emailSubject = $_POST['emailSubject'];
	$emailBody = preg_replace("/\n/", "<br>", $_POST['emailBody']);
    #$emailTo = $GLOBALS['config']->adminEmail;
    $emailTo = "Rob Callahan<Rob.Callahan@neustar.biz>";

	$headers = join("\r\n", array(
		"MIME-Version: 1.0",
		"Content-type: text/html; charset=us-ascii",
		"From: {$emailFrom}",
		"Reply-To: {$emailFrom}",
		"X-Priority: 1",
		"X-MSMail-Priority: High",
		"X-Mailer: PHP/" . phpversion()
	));


	mail($emailTo, $emailSubject, $emailBody, $headers);
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
			"errorStack" => $e->getTraceAsString(),
			"output"     => ""
			)
		);
	exit;
}

print json_encode(
	array(
		"returnCode" => 0,
		"errorCode"  => 0,
		"errorText"  => "",
		"output"     => ""
		)
	);
exit;

