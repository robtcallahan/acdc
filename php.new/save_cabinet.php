<?php
/*******************************************************************************
 *
 * $params['id']: save_cabinet.php 79676 2013-10-08 20:09:32Z rcallaha $
 * $Date: 2013-10-25 10:05:03 -0400 (Fri, 25 Oct 2013) $
 * $Author: rcallaha $
 * $Revision: 80341 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/save_cabinet.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

use STS\CMDB\CMDBLocationTable;
use STS\CMDB\CMDBRackTable;
use STS\Util\HTTPParameters;

try 
{
    $cmdbLocationTable = new CMDBLocationTable();
    $cmdbRackTable = new CMDBRackTable($useUserCredentials=true);

    $locationTable = new LocationTable();
	$cabinetTable = new CabinetTable();
	$cabinet = new Cabinet();

    // POST params
    $httpParams = new HTTPParameters();
    $params     = $httpParams->getParams(array('action', 'id', 'name', 'ctId', 'locationId', 'x', 'y'));

	if ($params['action'] == "save")
	{

        if ($params['id'] == 0) {
            $cabinet->setName($params['name']);
            $cabinet->setCabinetTypeId($params['ctId']);
            $cabinet->setLocationId($params['locationId']);
            $cabinet->setX($params['x']);
            $cabinet->setY($params['y']);

            $cabinet = $cabinetTable->create($cabinet);
        }

        else {
            $cabinet = $cabinetTable->getById($params['id']);

            // check for the existance of a sysid on the rack
            if (!$cabinet->getSysId() && !preg_match("/^(STS|PDU|New)/", $params['name'])) {
                // get the local and cmdb locations
                $location = $locationTable->getById($params['locationId']);
                $cmdbLocation = $cmdbLocationTable->getBySysId($location->getSysId());
                $cmdbRack = $cmdbRackTable->getByNameAndLocationId($params['name'], $cmdbLocation->getSysId());

                // try to find the cmdb rack. If it doesn't exist, we need to create it
                if ($cmdbRack->getSysId() == null) {
                    // rack doesn't exist in CMDB, need to create a new CI
                    $cmdbRack = new \STS\CMDB\CMDBRack();
                    $cmdbRack->setName($params['name'])
                        ->setLocationId($cmdbLocation->getSysId());
                    $cmdbRack = $cmdbRackTable->create($cmdbRack);
                }
                $cabinet->setSysId($cmdbRack->getSysId());
            }

			$cabinet->setName($params['name'])
			    ->setCabinetTypeId($params['ctId'])
			    ->setLocationId($params['locationId'])
			    ->setX($params['x'])
			    ->setY($params['y']);
			
			$cabinetTable->update($cabinet);
		}
	}

	else if ($params['action'] == "delete") {
		$cabinet = $cabinetTable->getById($params['id']);
		$cabinetTable->delete($cabinet);
	}
	
	echo json_encode(
		array(
			"returnCode" => 0,
			"cabinet" => $cabinet->toObject()
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

