<?php

include __DIR__ . "/../config/global.php";

try {
	// config
	$config = $GLOBALS['config'];

	// get the user 
	$userName = $_SERVER["PHP_AUTH_USER"];

	// get the requested report type
	$reportType = $_POST['reportType'];

	switch ($reportType) {
		case "floorTileUtil":
			include "get_report_floor_tile_usage.php";
			break;
        case "ruReservations":
            include "get_report_ru_reservations.php";
         			break;
		default:
			include "get_report_floor_tile_usage.php";
			break;
	}
}

catch (Exception $e) {
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
	exit;
}

