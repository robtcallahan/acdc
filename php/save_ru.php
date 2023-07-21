<?php

include __DIR__ . "/../config/global.php";

try {

    $post = file_get_contents("php://input");
    $params = json_decode($post);
    $action = property_exists($params, "action") ? $params->action : "save";

    $ruTable = new RUTable();
    $ru = $ruTable->getById($params->id);

    // new object
    if (!$ru->getId()) {
        $ru->setCabinetId($params->cabinetId)
            ->setRuNumber($params->ruNumber)
            ->setUsable($params->usable);
        $ru = $ruTable->create($ru);
    }
    else if ($action == "delete") {
        $ruTable->delete($ru);
    }
    // update object
    else {
        $ru->setCabinetId($params->cabinetId)
            ->setRuNumber($params->ruNumber)
            ->setUsable($params->usable);
        $ru = $ruTable->update($ru);
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "ru"         => $ru->toObject()
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

