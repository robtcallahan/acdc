<?php
/*******************************************************************************
 *
 * $Id: get_images.php 77193 2013-07-26 17:40:04Z rcallaha $
 * $Date: 2013-07-26 13:40:04 -0400 (Fri, 26 Jul 2013) $
 * $Author: rcallaha $
 * $Revision: 77193 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_images.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try 
{
	$cabinetTypeTable = new CabinetTypeTable();
	$cabinetTypes = $cabinetTypeTable->getAll();
	
	$data = array();
	for ($i=0; $i<count($cabinetTypes); $i++)
	{
		$cabinetType = $cabinetTypes[$i];
		$data[] = array(
			"id"        => $cabinetType->getId(),
			"name"      => $cabinetType->getName(),
			"type"      => $cabinetType->getType(),
			"imageName" => $cabinetType->getImageName(),
			"length"    => $cabinetType->getLength(),
			"width"     => $cabinetType->getWidth()
			);
	}
	
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

