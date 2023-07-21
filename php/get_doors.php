<?php
/*******************************************************************************
 *
 * $Id: get_cabinets.php 81889 2013-12-11 20:43:06Z rcallaha $
 * $Date: 2013-12-11 15:43:06 -0500 (Wed, 11 Dec 2013) $
 * $Author: rcallaha $
 * $Revision: 81889 $
 * $HeadURL: https://svn.ultradns.net/svn/sts_tools/acdc/trunk/php/get_cabinets.php $
 *
 *******************************************************************************
 */

include __DIR__ . "/../config/global.php";

try {
    $locationId = array_key_exists('locationId', $_POST) ? $_POST['locationId'] : 3;

    $doorTable = new DoorTable();
    $doors     = $doorTable->getAllByLocationId($locationId);

    $data = array();
    foreach ($doors as $door) {
        $data[] = array(
            "id"               => $door->getId(),
            "locationId"       => $door->getLocationId(),
            "centerX"          => $door->getCenterX(),
            "centerY"          => $door->getCenterY(),
            "radius"           => $door->getRadius(),
            "startAngle"       => $door->getStartAngle(),
            "clockwise"        => $door->getClockwise(),
            "width"            => $door->getWidth(),
            "color"            => $door->getColor()
        );
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "doors"      => $data
        )
    );
} catch (Exception $e) {
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
