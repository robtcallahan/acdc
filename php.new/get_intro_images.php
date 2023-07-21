<?php
/*******************************************************************************
 *
 * $Id: get_intro_images.php 77404 2013-08-01 15:47:42Z rcallaha $
 * $Date: 2013-08-01 11:47:42 -0400 (Thu, 01 Aug 2013) $
 * $Author: rcallaha $
 * $Revision: 77404 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_intro_images.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try 
{
    $data[] = array(
        "id"        => 1,
        "imageName" => 'emc_vmax.png',
        "length"    => 200,
        "width"     => 100
        );

	echo json_encode(
		array(
			"returnCode" => 0,
			"data"     => $data
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

