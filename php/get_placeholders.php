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

    $phTable = new PlaceholderTable();
    $placeholders = $phTable->getAllByLocationId($locationId);

   	$cabinetTypeTable = new CabinetTypeTable();

    $data = array();
    foreach ($placeholders as $p) {
        // get the cabinet type
		$placeholderType = $cabinetTypeTable->getById($p->getCabinetTypeId());

        $data[] = array(
            "id"           => intval($p->getId()),
            "locationId"   => intval($p->getLocationId()),
            "text"         => $p->getText() ? $p->getText() : "",
            "ctId"         => $p->getCabinetTypeId(),
            "ctType"       => $placeholderType->getType(),
            "ctImageName"  => $placeholderType->getImageName() ? $placeholderType->getImageName() : "",
            "ctLength"     => $placeholderType->getLength(),
            "ctWidth"      => $placeholderType->getWidth(),
            "scaleX"       => $p->getScaleX(),
            "scaleY"       => $p->getScaleY(),
            "x"            => $p->getX(),
            "y"            => $p->getY(),
            "tileX"        => $p->getTileX(),
            "tileY"        => $p->getTileY(),
            "rotation"     => $p->getRotation()
        );
    }

    echo json_encode(
        array(
            "returnCode"   => 0,
            "placeholders" => $data
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
