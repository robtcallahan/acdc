<?php

$locationTable = new LocationTable();
$cabinetTable  = new CabinetTable();
$reservationTable = new RUReservationTable();

$locations = $locationTable->getAll();

$grid = array();

$lastLocationName = "";
foreach ($locations as $location) {
    $locationName = $location->getName();
    $reservations = $reservationTable->getAllByLocationId($location->getId());

    foreach ($reservations as $r) {
        $grid[] = array(
            "locationName"         => $r->getLocationName(),
            "projectName"          => $r->getProjectName(),
            "businessService"      => $r->getBusinessService(),
            "cabinetName"          => $r->getCabinetName(),
            "elevation"            => $r->getElevation(),
            "numRUs"               => $r->getNumRUs(),
            "assetName"            => $r->getAssetName(),
            "model"                => $r->getModel(),
            "serialNumber"         => $r->getSerialNumber(),
            "assetTag"             => $r->getAssetTag(),
            "reservationDate"      => $r->getReservationDate(),
            "estimatedInstallDate" => $r->getEstimatedInstallDate()
        );
    }
}

if (isset($export) && $export) {
    include "export_report_ru_reservations.php";
} else {
    echo json_encode(
        array(
            "returnCode" => 0,
            "total"      => count($grid),
            "grid"       => $grid
        )
    );
    exit;
}
