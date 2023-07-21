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

    $lineTable = new LineTable();
    $lines     = $lineTable->getAllByLocationId($locationId);

    $data = array();
    foreach ($lines as $line) {
        $data[] = array(
            "id"         => intval($line->getId()),
            "locationId" => intval($line->getLocationId()),
            "top"        => $line->getTop(),
            "left"       => $line->getLeft(),
            "width"      => $line->getWidth(),
            "height"     => $line->getHeight(),
            "angle"      => $line->getAngle(),
            "scaleX"     => $line->getScaleX(),
            "scaleY"     => $line->getScaleY(),
            "x1"         => $line->getX1(),
            "y1"         => $line->getY1(),
            "x2"         => $line->getX2(),
            "y2"         => $line->getY2(),
            "color"      => $line->getColor(),
            "thickness"  => $line->getThickness(),
            "cap"        => $line->getCap()
        );
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "lines"      => $data
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
