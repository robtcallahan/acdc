<?php

include __DIR__ . "/../config/global.php";

try {
    $locationId = array_key_exists('locationId', $_POST) ? $_POST['locationId'] : 3;

    $textTable = new TextTable();
    $strings     = $textTable->getAllByLocationId($locationId);

    $data = array();
    foreach ($strings as $s) {
        $data[] = array(
            "id"         => intval($s->getId()),
            "locationId" => intval($s->getLocationId()),
            "string"     => $s->getString(),
            "fontFamily" => $s->getFontFamily(),
            "fontSize"   => $s->getFontSize(),
            "fontWeight" => $s->getFontWeight(),
            "color"      => $s->getColor(),
            "x"          => $s->getX(),
            "y"          => $s->getY(),
            "rotation"   => intval($s->getRotation())
        );
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "text"       => $data
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
