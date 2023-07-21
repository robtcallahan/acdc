<?php

include __DIR__ . "/../config/global.php";

// excel style array for the column heads
$headStyle = array(
	'font'      => array(
		'bold' => true
	),
	'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_LEFT),
	'borders'   => array(
		'allborders' => array('style' => PHPExcel_Style_Border::BORDER_THIN)
	),
	'fill'      => array(
		'type'  => PHPExcel_Style_Fill::FILL_SOLID,
		'color' => array('rgb' => '99CCFF')
	)
);

$alignRight = array(
	'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_RIGHT)
);

$switchStyle = array(
	'font'    => array('bold' => true),
	'borders' => array(
		'allborders' => array('style' => PHPExcel_Style_Border::BORDER_THIN)
	),
	'fill'    => array(
		'type'  => PHPExcel_Style_Fill::FILL_SOLID,
		'color' => array('rgb' => 'FFFFCC')
	)
);

$spacerStyle = array(
	'borders' => array(
		'allborders' => array('style' => PHPExcel_Style_Border::BORDER_THIN)
	),
	'fill'    => array(
		'type'  => PHPExcel_Style_Fill::FILL_SOLID,
		'color' => array('rgb' => 'C0C0C0')
	)
);

$subtotalStyle = array(
	'borders' => array(
		'top'    => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			'color' => array('rgb' => '000000')
		),
		'bottom' => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			'color' => array('rgb' => '000000')
		),
		'left' => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			'color' => array('rgb' => 'CCCCCC')
		),
		'right' => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			'color' => array('rgb' => 'CCCCCC')
		)
	),
	'fill'    => array(
		'type'  => PHPExcel_Style_Fill::FILL_SOLID,
		'color' => array('rgb' => 'F5F5F5')
	),
	'font'    => array(
		'bold' => true
	)
);



$boldStyle = array(
	'font'    => array(
		'bold' => true
	)
);

$highlightStyle = array(
	'borders' => array(
		'allborders' => array(
			'style' => PHPExcel_Style_Border::BORDER_THIN,
			'color' => array('rgb' => 'CCCCCC')
		)
	),
	'fill'    => array(
		'type'  => PHPExcel_Style_Fill::FILL_SOLID,
		'color' => array('rgb' => 'FDFFA0')
	)
);

try {
	// read the config file
	$config = $GLOBALS['config'];

	// get the requested report type
	$reportType = $_POST['reportType'];

	switch ($reportType) {
		case "floorTileUtil":
			$title  = "Floor Tile Util by Location";
			$export = true;
			include "get_report_floor_tile_usage.php";
			break;
        case "ruReservations":
      			$title  = "RU Reservations";
      			$export = true;
      			include "get_report_ru_reservations.php";
      			break;
		default:
            $title  = "Floor Tile Util by Location";
            $export = true;
            include "get_report_floor_tile_usage.php";
			break;
	}

	$dateStamp     = date('Y-m-d');
	$excelFileName = "ACDC {$title} {$dateStamp}.xlsx";

	// Save Excel 2007 file
	$excelWriter = new PHPExcel_Writer_Excel2007($excel);
	$excelWriter->save("{$config->exportDir}/{$excelFileName}");

    /*
header("Content-Type:   application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=abc.xls");  //File name extension was wrong
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Cache-Control: private",false);
         */

	$data = file_get_contents("{$config->exportDir}/{$excelFileName}");
	header("Pragma: public");
    #header("Content-Type: application/ms-excel");
    header("Content-Type:   application/vnd.ms-excel; charset=utf-8");
    header('Content-Disposition: attachment; filename="' . $excelFileName . '"');
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Length: " . (strlen($data) * 8));

	// echo and exit
	echo $data;
}

catch (Exception $e) {
	print "<pre>";
	printf("%-12s => %s\n", "returnCode", 1);
	printf("%-12s => %s\n", "errorCode", $e->getCode());
	printf("%-12s => %s\n", "errorText", $e->getMessage());
	printf("%-12s => %s\n", "errorFile", $e->getFile());
	printf("%-12s => %s\n", "errorLine", $e->getLine());
	printf("%-12s => \n%s\n", "errorStack", $e->getTraceAsString());
	print "</pre>";
}

function writeRow(PHPExcel_Worksheet &$sheet, $o, $row) {
	global $fields, $colNames;

	$n = 0;
	foreach ($fields as $f) {
		if ($f == "spacer") {
			$sheet->SetCellValue($colNames[$n] . $row, "");
		} else {
			$sheet->SetCellValue($colNames[$n] . $row, $o[$f]);
		}
		$n++;
	}
}

// Deprecated function
function writeFields(PHPExcel_Worksheet &$sheet, $o, $row) {
	global $fields, $colNames;

	$i = 0;
	foreach ($fields as $f) {
		$sheet->SetCellValue($colNames[$i] . $row, $o->$f);
		$i++;
	}
}

