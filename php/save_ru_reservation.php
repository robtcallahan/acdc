<?php

include __DIR__ . "/../config/global.php";

try {

    $post = file_get_contents("php://input");
    $params = json_decode($post);
    $action = property_exists($params, "action") ? $params->action : "save";

    $ruResTable = new RUReservationTable();
    $ruRes = $ruResTable->getById($params->id);

    // new object
    if (!$ruRes->getId()) {
        $ruRes->setCabinetId($params->cabinetId)
              ->setElevation($params->elevation)
              ->setNumRUs($params->numRUs)
              ->setRuNumbers($params->ruNumbers)
              ->setProjectName($params->projectName)
              ->setEstimatedInstallDate($params->estimatedInstallDate)
              ->setBusinessService($params->businessService)
              ->setBusinessServiceId($params->businessServiceId)
              ->setAssetName($params->assetName)
              ->setModel($params->model)
              ->setSerialNumber($params->serialNumber)
              ->setAssetTag($params->assetTag)
              ->setReservationDate(date('Y-m-d h:i:s'));
        $ruRes = $ruResTable->create($ruRes);
    }
    else if ($action == "delete") {
        $ruResTable->delete($ruRes);
    }
    // update object
    else {
        $ruRes->setRuNumbers($params->ruNumbers)
              ->setElevation($params->elevation)
              ->setNumRUs($params->numRUs)
              ->setProjectName($params->projectName)
              ->setEstimatedInstallDate($params->estimatedInstallDate)
              ->setBusinessService($params->businessService)
              ->setBusinessServiceId($params->businessServiceId)
              ->setAssetName($params->assetName)
              ->setModel($params->model)
              ->setSerialNumber($params->serialNumber)
              ->setAssetTag($params->assetTag);
        $ruRes = $ruResTable->update($ruRes);
    }

    echo json_encode(
        array(
            "returnCode" => 0,
            "ruRes"      => $ruRes->toObject()
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

