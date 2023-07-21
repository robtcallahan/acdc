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

use STS\Util\HTTPParameters;

try 
{
	$lineTable = new LineTable();
	$line = new Line();

    // POST params
    $httpParams = new HTTPParameters();
    $params     = $httpParams->getParams(array('action', 'id', 'locationId', 'x1', 'y1', 'x2', 'y2', 'color', 'width', 'cap'));

	if ($params['action'] == "save")
	{
        if ($params['id'] == 0) {
            $line->setLocationId($params['locationId'])
                ->setX1($params['x1'])
                ->setY1($params['y1'])
                ->setX2($params['x2'])
                ->setY2($params['y2'])
                ->setColor($params['color'])
                ->setWidth($params['width'])
                ->setCap($params['cap']);

            $line = $lineTable->create($line);
        } else {
            $line = $lineTable->getById($params['id']);

            $line->setX1($params['x1'])
                ->setY1($params['y1'])
                ->setX2($params['x2'])
                ->setY2($params['y2'])
                ->setColor($params['color'])
                ->setWidth($params['width'])
                ->setCap($params['cap']);

			$lineTable->update($line);
		}
	}

	else if ($params['action'] == "delete") {
        $line = $lineTable->getById($params['id']);
        $lineTable->delete($line);
	}
	
	echo json_encode(
		array(
			"returnCode" => 0,
			"line" => $line->toObject()
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

