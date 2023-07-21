<?php

$locationTable = new LocationTable();
$cabinetTable  = new CabinetTable();
$placeHolderTable = new PlaceholderTable();

$locations = $locationTable->getAll();
$cabinetTypeId = 19; // Placeholder 24" x 48"

$grid = array();

$lastLocationName = "";
foreach ($locations as $location) {
    $locationName = $location->getName();
    $cabinets = $cabinetTable->getAllCabinetsByLocationId($location->getId());
    $placeholders = $placeHolderTable->getAllByLocationIdAndCabinetTypeId($location->getId(), $cabinetTypeId);

    $numCabinets = count($cabinets);
    $numPlaceholders = count($placeholders);

    if ($numPlaceholders < $numCabinets) {
        $unusedTiles = "Unknown";
        $comments = "Available Tile Markers have not been added to this location.";
    } else {
        $unusedTiles = $numPlaceholders - $numCabinets;
        $comments = "";
    }
    $grid[]          = array(
        "locationName"    => $location->getName(),
        "usedTiles"       => $numCabinets,
        "unusedTiles"     => $unusedTiles,
        "totalTiles"      => $numPlaceholders,
        "comments"        => $comments
    );
}

if (isset($export) && $export) {
    include "export_report_floor_tile_usage.php";
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
